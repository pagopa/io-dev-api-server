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

import { getService, getServiceMetadata } from "../../utils/service";
import { frontMatter1CTASiciliaVola } from "../../utils/variables";

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

const withSiciliaVolaService = (
  organizationFiscalCode: OrganizationFiscalCode
): ServicePublic => ({
  ...siciliaVolaService,
  organization_fiscal_code: organizationFiscalCode
});

export const cgnServiceId = "serviceCgn";
const cgnService: ServicePublic = {
  ...getService(cgnServiceId),
  organization_name: "Carta Giovani Nazionale" as OrganizationName,
  service_name: "Carta Giovani Nazionale" as ServiceName,
  service_metadata: {
    ...getServiceMetadata(ServiceScopeEnum.NATIONAL),
    category: SpecialServiceCategoryEnum.SPECIAL,
    custom_special_flow: "cgn" as SpecialServiceMetadata["custom_special_flow"]
  }
};

const withCgnService = (
  organizationFiscalCode: OrganizationFiscalCode
): ServicePublic => ({
  ...cgnService,
  organization_fiscal_code: organizationFiscalCode
});

// eventually add the special services based on config flags
export const withSpecialServices = (
  services: ReadonlyArray<ServicePublic>,
  includeSiciliaVola = false,
  includeCgn = false
): ReadonlyArray<ServicePublic> => {
  // list of tuple where the first element is a flag indicating if the relative service should be included
  // the second element is the service factory
  const specialServicesFactory: ReadonlyArray<readonly [
    boolean,
    (organizationFiscalCode: OrganizationFiscalCode) => ServicePublic
  ]> = [
    [includeSiciliaVola, withSiciliaVolaService],
    [includeCgn, withCgnService]
  ];

  return specialServicesFactory.reduce((acc, curr) => {
    if (curr[0]) {
      const organizationIds = new Set(acc.map(s => s.organization_fiscal_code));
      // tslint:disable-next-line: no-let
      let startId = organizationIds.size;
      // to avoid organizations fiscal code clash
      while (organizationIds.has(getOrganizationFiscalCode(startId))) {
        startId++;
      }
      const newOrganizationId = getOrganizationFiscalCode(startId);
      return [...acc, curr[1](newOrganizationId)];
    }
    return acc;
  }, services);
};
