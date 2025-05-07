import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { OrganizationFiscalCode } from "../../../../generated/definitions/services/OrganizationFiscalCode";
import { ScopeTypeEnum } from "../../../../generated/definitions/services/ScopeType";
import { ServiceDetails } from "../../../../generated/definitions/services/ServiceDetails";
import { ServiceId } from "../../../../generated/definitions/services/ServiceId";
import { ServiceMetadata } from "../../../../generated/definitions/services/ServiceMetadata";
import { SpecialServiceCategoryEnum } from "../../../../generated/definitions/services/SpecialServiceCategory";
import { SpecialServiceMetadata } from "../../../../generated/definitions/services/SpecialServiceMetadata";
import {
  createServiceFromFactory,
  createServiceMetadataFromFactory,
  SpecialServiceGenerator
} from "../../services/persistence/services/factory";

export const pnServiceId = "servicePN" as ServiceId;
export const pnOptInServiceId = "01G74SW1PSM6XY2HM5EGZHZZET";

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
  createService: (serviceId: string) => ServiceDetails,
  createServiceMetadata: (scope: ScopeTypeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
): ServiceDetails => ({
  ...createService(pnServiceId),
  organization: {
    fiscal_code: organizationFiscalCode,
    name: "SEND" as NonEmptyString
  },
  metadata: {
    ...createServiceMetadata(ScopeTypeEnum.NATIONAL),
    category: SpecialServiceCategoryEnum.SPECIAL,
    custom_special_flow: "pn" as SpecialServiceMetadata["custom_special_flow"]
  },
  name: "Notifiche digitali" as NonEmptyString
});

export const createPnOptInService = (): ServiceDetails => ({
  ...createServiceFromFactory(pnOptInServiceId),
  organization: {
    fiscal_code: "00000009898" as OrganizationFiscalCode,
    name: "SEND" as NonEmptyString
  },
  metadata: {
    ...createServiceMetadataFromFactory(ScopeTypeEnum.NATIONAL)
  },
  name: "Novità e aggiornamenti" as NonEmptyString
});
