import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { ServicePublic } from "../../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../../generated/definitions/backend/ServiceScope";
import { Institution } from "../../../../generated/definitions/services/Institution";

export type InstitutionWithScope = Institution & { scope?: ServiceScopeEnum };

export const getInstitutions = (
  services: ServicePublic[]
): InstitutionWithScope[] =>
  pipe(
    services,
    A.uniq({
      equals: (x, y) =>
        x.organization_fiscal_code === y.organization_fiscal_code
    }),
    A.map(service => ({
      id: service.organization_fiscal_code,
      name: service.organization_name,
      fiscal_code: service.organization_fiscal_code,
      scope: service.service_metadata?.scope
    }))
  );
