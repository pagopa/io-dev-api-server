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

const siciliaVolaServiceId = "serviceSv";
const siciliaVolaService: ServicePublic = {
  ...getService(siciliaVolaServiceId),
  organization_name: "Sicilia Vola" as OrganizationName,
  service_name: "Sicilia Vola" as ServiceName,
  service_metadata: {
    ...getServiceMetadata(ServiceScopeEnum.NATIONAL),
    cta: frontMatter1CTASiciliaVola as NonEmptyString
  }
};

const getOrganizationFiscalCode = (organizationsCount: number) =>
  `${organizationsCount}`.padStart(11, "0") as OrganizationFiscalCode;

const withSiciliaVolaService = (organizationsCount: number): ServicePublic => ({
  ...siciliaVolaService,
  organization_fiscal_code: getOrganizationFiscalCode(organizationsCount)
});

const cgnServiceId = "serviceCgn";
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
  organization_fiscal_code: getOrganizationFiscalCode(organizationsCount)
});

// list of tuple where the first element is a flag indicating if the relative service should be included
// the second element is the service factory
const specialServicesFactory: ReadonlyArray<readonly [
  boolean,
  (orgCount: number) => ServicePublic
]> = [
  [ioDevServerConfig.services.includeSiciliaVola, withSiciliaVolaService],
  [ioDevServerConfig.services.includeCgn, withCgnService]
];

// eventually add the special services based on config flags
export const withSpecialServices = (
  services: ReadonlyArray<ServicePublic>
): ReadonlyArray<ServicePublic> =>
  specialServicesFactory.reduce((acc, curr) => {
    const organizationsCount = new Set(acc.map(s => s.organization_fiscal_code))
      .size;
    if (curr[0]) {
      return [...acc, curr[1](organizationsCount)];
    }
    return acc;
  }, services);
