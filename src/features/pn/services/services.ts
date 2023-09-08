import { OrganizationFiscalCode } from "../../../../generated/definitions/backend/OrganizationFiscalCode";
import { OrganizationName } from "../../../../generated/definitions/backend/OrganizationName";
import { ServiceId } from "../../../../generated/definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../../generated/definitions/backend/ServiceMetadata";
import { ServiceName } from "../../../../generated/definitions/backend/ServiceName";
import { ServicePublic } from "../../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../../generated/definitions/backend/ServiceScope";
import { SpecialServiceCategoryEnum } from "../../../../generated/definitions/backend/SpecialServiceCategory";
import { SpecialServiceMetadata } from "../../../../generated/definitions/backend/SpecialServiceMetadata";
import { SpecialServiceGenerator } from "../../../payloads/services/factory";

export const pnServiceId = "servicePN" as ServiceId;
export const pnOptInServiceId = "01G74SW1PSM6XY2HM5EGZHZZET" as ServiceId;

export const pnOptInCTA = `---
it:
    cta_1: 
        text: "Attiva il servizio"
        action: "ioit://services/service-detail?serviceId=servicePN&activate=true"
en:
    cta_1: 
        text: "Turn service on"
        action: "ioit://services/service-detail?serviceId=servicePN&activate=true"
---`;

export const createPnService: SpecialServiceGenerator = (
  createService: (serviceId: string) => ServicePublic,
  createServiceMetadata: (scope: ServiceScopeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
): ServicePublic => ({
  ...createService(pnServiceId),
  organization_name: "SEND" as OrganizationName,
  service_name: "Notifiche digitali" as ServiceName,
  service_metadata: {
    ...createServiceMetadata(ServiceScopeEnum.NATIONAL),
    category: SpecialServiceCategoryEnum.SPECIAL,
    custom_special_flow: "pn" as SpecialServiceMetadata["custom_special_flow"]
  },
  organization_fiscal_code: organizationFiscalCode
});

export const createPnOptInService: SpecialServiceGenerator = (
  createService: (serviceId: string) => ServicePublic,
  createServiceMetadata: (scope: ServiceScopeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
): ServicePublic => ({
  ...createService(pnOptInServiceId),
  organization_name: "SEND" as OrganizationName,
  service_name: "Novità e aggiornamenti" as ServiceName,
  service_metadata: {
    ...createServiceMetadata(ServiceScopeEnum.NATIONAL),
    category: SpecialServiceCategoryEnum.SPECIAL,
    custom_special_flow: "pn" as SpecialServiceMetadata["custom_special_flow"]
  },
  organization_fiscal_code: organizationFiscalCode
});
