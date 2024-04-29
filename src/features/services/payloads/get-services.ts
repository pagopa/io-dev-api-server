import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { InstitutionServicesResource } from "../../../../generated/definitions/services/InstitutionServicesResource";
import { ServiceMinified } from "../../../../generated/definitions/services/ServiceMinified";
import ServicesDB from "../../../persistence/services";

export const getServicesByInstitutionIdResponsePayload = (
  institutionId: string,
  limit: number = 20,
  offset: number = 0
): O.Option<InstitutionServicesResource> => {
  const filteredServices: ServiceMinified[] = pipe(
    ServicesDB.getAllServices(),
    A.filterMap(
      ({ organization_fiscal_code, service_id, service_name, version }) => {
        if (organization_fiscal_code === institutionId) {
          return O.some({
            id: service_id,
            name: service_name,
            version
          });
        }
        return O.none;
      }
    )
  );

  const totalElements = filteredServices.length;
  const startIndex = offset;
  const endIndex = offset + limit;
  const servicesList = _.slice(filteredServices, startIndex, endIndex);

  return O.some({
    services: servicesList,
    limit,
    offset,
    count: totalElements
  });
};
