import * as A from "fp-ts/lib/Array";
import { identity, pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { ServicePublic } from "../../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../../generated/definitions/backend/ServiceScope";
import { Institution } from "../../../../generated/definitions/services/Institution";
import { InstitutionsResource } from "../../../../generated/definitions/services/InstitutionsResource";
import ServicesDB from "../../../persistence/services";

const filterByScope = (service: ServicePublic, scope?: ServiceScopeEnum) => {
  if (!scope) {
    return true;
  }
  return service.service_metadata?.scope === scope;
};

const filterBySearch = (service: ServicePublic, search?: string) => {
  if (!search) {
    return true;
  }
  return service.service_name.toLowerCase().includes(search);
};

export const getInstitutionsResponsePayload = (
  limit: number = 20,
  offset: number = 0,
  scope?: ServiceScopeEnum,
  search?: string
): InstitutionsResource => {
  const filteredInstitutions = pipe(
    ServicesDB.getAllServices(),
    A.reduce([] as Institution[], (accumulator, service) => {
      const isValidService = pipe(
        [
          (service: ServicePublic) => filterByScope(service, scope),
          (service: ServicePublic) => filterBySearch(service, search)
        ],
        A.flap(service),
        A.every(identity)
      );

      if (isValidService) {
        return [
          ...accumulator,
          {
            id: service.organization_fiscal_code,
            name: service.organization_name,
            fiscal_code: service.organization_fiscal_code
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

  const response: InstitutionsResource = {
    institutions: istitutionList,
    limit,
    offset,
    count: totalElements
  };

  return response;
};
