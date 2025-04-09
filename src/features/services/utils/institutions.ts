import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { ServiceDetails } from "../../../../generated/definitions/services/ServiceDetails";
import { ScopeTypeEnum } from "../../../../generated/definitions/services/ScopeType";
import { Institution } from "../../../../generated/definitions/services/Institution";

export type InstitutionWithScope = Institution & { scope?: ScopeTypeEnum };

export const getInstitutions = (
  services: ServiceDetails[]
): InstitutionWithScope[] =>
  pipe(
    services,
    A.uniq({
      equals: (x, y) =>
        x.organization.fiscal_code === y.organization.fiscal_code
    }),
    A.map(service => ({
      id: service.organization.fiscal_code,
      name: service.organization.name,
      fiscal_code: service.organization.fiscal_code,
      scope: service.metadata.scope
    }))
  );
