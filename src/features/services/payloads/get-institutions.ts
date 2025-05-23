import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { identity, pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { Institution } from "../../../../generated/definitions/services/Institution";
import { InstitutionsResource } from "../../../../generated/definitions/services/InstitutionsResource";
import ServicesDB from "../persistence/servicesDatabase";
import { InstitutionWithScope, getInstitutions } from "../utils/institutions";
import { ScopeTypeEnum } from "../../../../generated/definitions/services/ScopeType";

const filterByScope = (
  institution: InstitutionWithScope,
  scope?: ScopeTypeEnum
) => {
  if (!scope) {
    return true;
  }
  return institution.scope === scope;
};

const filterBySearch = (institution: InstitutionWithScope, search?: string) => {
  if (!search) {
    return true;
  }
  return institution.name.toLowerCase().includes(search.toLowerCase());
};

export const getInstitutionsResponsePayload = (
  limit: number = 20,
  offset: number = 0,
  scope?: ScopeTypeEnum,
  search?: string
): O.Option<InstitutionsResource> => {
  const filteredInstitutions = pipe(
    ServicesDB.getAllServices(),
    getInstitutions,
    A.reduce([] as Institution[], (accumulator, institution) => {
      const isValidInstitution = pipe(
        [
          (institution: InstitutionWithScope) =>
            filterByScope(institution, scope),
          (institution: InstitutionWithScope) =>
            filterBySearch(institution, search)
        ],
        A.flap(institution),
        A.every(identity)
      );

      if (isValidInstitution) {
        return [
          ...accumulator,
          {
            id: institution.id,
            name: institution.name,
            fiscal_code: institution.fiscal_code
          }
        ];
      }

      return accumulator;
    })
  );

  const totalElements = filteredInstitutions.length;
  const startIndex = offset;
  const endIndex = offset + limit;
  const istitutionList = _.slice(filteredInstitutions, startIndex, endIndex);

  return O.some({
    institutions: istitutionList,
    limit,
    offset,
    count: totalElements
  });
};
