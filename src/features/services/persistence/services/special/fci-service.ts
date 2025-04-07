import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { SpecialServiceGenerator } from "../factory";
import { ServiceDetails } from "../../../../../../generated/definitions/services/ServiceDetails";
import { ScopeTypeEnum } from "../../../../../../generated/definitions/services/ScopeType";
import { ServiceMetadata } from "../../../../../../generated/definitions/services/ServiceMetadata";
import { ServiceId } from "../../../../../../generated/definitions/services/ServiceId";

const fciServiceId = "serviceFci" as ServiceId;

export const createFciService: SpecialServiceGenerator = (
  createService: (serviceId: string) => ServiceDetails,
  createServiceMetadata: (scope: ScopeTypeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
): ServiceDetails => ({
  ...createService(fciServiceId),
  organization: {
    fiscal_code: organizationFiscalCode,
    name: "Firma con IO" as NonEmptyString
  },
  metadata: {
    ...createServiceMetadata(ScopeTypeEnum.NATIONAL)
  },
  name: "Firma con IO" as NonEmptyString
});
