import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { SpecialServiceGenerator } from "../factory";
import { ServiceDetails } from "../../../../../../generated/definitions/services/ServiceDetails";
import { ScopeTypeEnum } from "../../../../../../generated/definitions/services/ScopeType";
import { ServiceMetadata } from "../../../../../../generated/definitions/services/ServiceMetadata";
import { SpecialServiceCategoryEnum } from "../../../../../../generated/definitions/services/SpecialServiceCategory";
import { SpecialServiceMetadata } from "../../../../../../generated/definitions/services/SpecialServiceMetadata";
import { ServiceId } from "../../../../../../generated/definitions/services/ServiceId";

const cdcServiceId = "01G2AFTME08TS0QD2P2S682CJ0" as ServiceId;

export const createCdcService: SpecialServiceGenerator = (
  createService: (serviceId: string) => ServiceDetails,
  createServiceMetadata: (scope: ScopeTypeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
): ServiceDetails => ({
  ...createService(cdcServiceId),
  organization: {
    fiscal_code: organizationFiscalCode,
    name: "Ministero beni culturali" as NonEmptyString
  },
  metadata: {
    ...createServiceMetadata(ScopeTypeEnum.NATIONAL),
    category: SpecialServiceCategoryEnum.SPECIAL,
    custom_special_flow: "cdc" as SpecialServiceMetadata["custom_special_flow"]
  },
  name: "Carta Della Cultura" as NonEmptyString
});
