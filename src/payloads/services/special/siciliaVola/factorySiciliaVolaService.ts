import { NonEmptyString, OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { OrganizationName } from "../../../../../generated/definitions/backend/OrganizationName";
import { ServiceName } from "../../../../../generated/definitions/backend/ServiceName";
import { ServicePublic } from "../../../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../../../generated/definitions/backend/ServiceScope";
import { ServiceMetadata } from "../../../../../generated/definitions/backend/ServiceMetadata";

const siciliaVolaServiceId = "serviceSv";

const frontMatter1CTASiciliaVola = `---
it:
    cta_1: 
        text: "Generate voucher"
        action: "ioit://SV_CHECK_STATUS"
    cta_2: 
        text: "Voucher List"
        action: "ioit://SV_VOUCHER_LIST"
en:
    cta_1: 
        text: "Generate voucher"
        action: "ioit://SV_CHECK_STATUS"
    cta_2: 
        text: "Voucher List"
        action: "ioit://SV_VOUCHER_LIST"
---`;

export const createSiciliaVolaService = (
  createService: ((serviceId: string) => ServicePublic),
  createServiceMetadata: ((scope: ServiceScopeEnum) => ServiceMetadata),
  organizationFiscalCode: OrganizationFiscalCode
): ServicePublic => ({
  ...createService(siciliaVolaServiceId),
  organization_fiscal_code: organizationFiscalCode,
  organization_name: "Sicilia Vola" as OrganizationName,
  service_name: "Sicilia Vola" as ServiceName,
  service_metadata: {
    ...createServiceMetadata(ServiceScopeEnum.NATIONAL),
    cta: frontMatter1CTASiciliaVola as NonEmptyString
  },
});
