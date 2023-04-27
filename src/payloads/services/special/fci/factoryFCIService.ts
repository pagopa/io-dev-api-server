import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ServiceMetadata } from "../../../../../generated/definitions/backend/ServiceMetadata";
import { ServicePublic } from "../../../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../../../generated/definitions/backend/ServiceScope";
import { OrganizationName } from "../../../../../generated/definitions/backend/OrganizationName";
import { ServiceName } from "../../../../../generated/definitions/backend/ServiceName";

const fciServiceId = "serviceFci";

export const createFciService = (
  createService: ((serviceId: string) => ServicePublic),
  createServiceMetadata: ((scope: ServiceScopeEnum) => ServiceMetadata),
  organizationFiscalCode: OrganizationFiscalCode
): ServicePublic => ({
  ...createService(fciServiceId),
  organization_name: "Firma con IO" as OrganizationName,
  service_name: "Firma con IO" as ServiceName,
  service_metadata: {
    ...createServiceMetadata(ServiceScopeEnum.NATIONAL)
  },
  organization_fiscal_code: organizationFiscalCode
});