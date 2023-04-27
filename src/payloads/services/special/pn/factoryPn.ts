import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ServiceMetadata } from "../../../../../generated/definitions/backend/ServiceMetadata";
import { ServicePublic } from "../../../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../../../generated/definitions/backend/ServiceScope";
import { OrganizationName } from "../../../../../generated/definitions/backend/OrganizationName";
import { ServiceName } from "../../../../../generated/definitions/backend/ServiceName";
import { SpecialServiceCategoryEnum } from "../../../../../generated/definitions/backend/SpecialServiceCategory";
import { SpecialServiceMetadata } from "../../../../../generated/definitions/backend/SpecialServiceMetadata";

export const pnServiceId = "servicePN";

export const createPnService = (
  createService: ((serviceId: string) => ServicePublic),
  createServiceMetadata: ((scope: ServiceScopeEnum) => ServiceMetadata),
  organizationFiscalCode: OrganizationFiscalCode
): ServicePublic => ({
  ...createService(pnServiceId),
  organization_name: "Piattaforma delle notifiche digitali" as OrganizationName,
  service_name: "Avvisi di cortesia" as ServiceName,
  service_metadata: {
    ...createServiceMetadata(ServiceScopeEnum.NATIONAL),
    category: SpecialServiceCategoryEnum.SPECIAL,
    custom_special_flow: "pn" as SpecialServiceMetadata["custom_special_flow"]
  },
  organization_fiscal_code: organizationFiscalCode
});