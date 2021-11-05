// We include here all the handlers and metadata needed on special services payloads
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "italia-ts-commons/lib/strings";
import { OrganizationName } from "../../../generated/definitions/backend/OrganizationName";
import { ServiceName } from "../../../generated/definitions/backend/ServiceName";
import { ServicePublic } from "../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../generated/definitions/backend/ServiceScope";
import { SpecialServiceCategoryEnum } from "../../../generated/definitions/backend/SpecialServiceCategory";
import { SpecialServiceMetadata } from "../../../generated/definitions/backend/SpecialServiceMetadata";
import { ioDevServerConfig } from "../../config";
import { getService, getServiceMetadata } from "../../utils/service";
import {
  frontMatter1CTASiciliaVola,
  frontMatter2CTA2
} from "../../utils/variables";

export const siciliaVolaServiceId = "serviceSv";
const siciliaVolaService: ServicePublic = {
  ...getService(siciliaVolaServiceId),
  organization_name: "Sicilia Vola" as OrganizationName,
  service_name: "Sicilia Vola" as ServiceName,
  service_metadata: {
    ...getServiceMetadata(ServiceScopeEnum.NATIONAL),
    cta: frontMatter1CTASiciliaVola as NonEmptyString
  }
};

const withSiciliaVolaService = (organizationsCount: number): ServicePublic => ({
  ...siciliaVolaService,
  organization_fiscal_code: `${organizationsCount}`.padStart(
    11,
    "0"
  ) as OrganizationFiscalCode
});

export const cgnServiceId = "serviceCgn";
const cgnService: ServicePublic = {
  ...getService(cgnServiceId),
  organization_name: "Carta Giovani Nazionale" as OrganizationName,
  service_name: "Carta Giovani Nazionale" as ServiceName,
  service_metadata: {
    ...getServiceMetadata(ServiceScopeEnum.NATIONAL),
    category: SpecialServiceCategoryEnum.SPECIAL,
    custom_special_flow: "cgn" as SpecialServiceMetadata["custom_special_flow"],
    cta: frontMatter2CTA2 as NonEmptyString
  }
};

const withCgnService = (organizationsCount: number): ServicePublic => ({
  ...cgnService,
  organization_fiscal_code: `${organizationsCount}`.padStart(
    11,
    "0"
  ) as OrganizationFiscalCode
});

export const specialServices: ReadonlyArray<readonly [
  boolean,
  (orgCount: number) => ServicePublic
]> = [
  [ioDevServerConfig.services.includeSiciliaVola, withSiciliaVolaService],
  [ioDevServerConfig.services.includeCgn, withCgnService]
];
