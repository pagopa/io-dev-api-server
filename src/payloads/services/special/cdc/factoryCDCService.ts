import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ServiceMetadata } from "../../../../../generated/definitions/backend/ServiceMetadata";
import { ServicePublic } from "../../../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../../../generated/definitions/backend/ServiceScope";
import { OrganizationName } from "../../../../../generated/definitions/backend/OrganizationName";
import { ServiceName } from "../../../../../generated/definitions/backend/ServiceName";
import { SpecialServiceCategoryEnum } from "../../../../../generated/definitions/backend/SpecialServiceCategory";
import { SpecialServiceMetadata } from "../../../../../generated/definitions/backend/SpecialServiceMetadata";
import { SpecialServiceGenerator } from "../../factory";
import { ServiceId } from "../../../../../generated/definitions/backend/ServiceId";

const cdcServiceId = "01G2AFTME08TS0QD2P2S682CJ0" as ServiceId;

export const createCdcService: SpecialServiceGenerator = (
  createService: (serviceId: string) => ServicePublic,
  createServiceMetadata: (scope: ServiceScopeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
): ServicePublic => ({
  ...createService(cdcServiceId),
  organization_name: "Ministero beni culturali" as OrganizationName,
  service_name: "Carta Della Cultura" as ServiceName,
  service_metadata: {
    ...createServiceMetadata(ServiceScopeEnum.NATIONAL),
    category: SpecialServiceCategoryEnum.SPECIAL,
    custom_special_flow: "cdc" as SpecialServiceMetadata["custom_special_flow"]
  },
  organization_fiscal_code: organizationFiscalCode
});
