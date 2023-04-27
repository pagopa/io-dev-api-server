import { range } from "lodash";
import { ServicePublic } from "../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../generated/definitions/backend/ServiceScope";
import { NonEmptyString, OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { OrganizationName } from "../../../generated/definitions/backend/OrganizationName";
import { DepartmentName } from "../../../generated/definitions/backend/DepartmentName";
import { ServiceName } from "../../../generated/definitions/backend/ServiceName";
import { NotificationChannelEnum } from "../../../generated/definitions/backend/NotificationChannel";
import { faker } from "@faker-js/faker/locale/it";
import { validatePayload } from "../../utils/validator";
import { ServiceMetadata } from "../../../generated/definitions/backend/ServiceMetadata";
import { StandardServiceCategoryEnum } from "../../../generated/definitions/backend/StandardServiceCategory";
import { SpecialServicesConfig } from "../../types/config";
import { frontMatter2CTA2 } from "../../utils/variables";
import { createSiciliaVolaService } from "./special/siciliaVola/factorySiciliaVolaService";
import { createCgnService } from "./special/cgn/factoryCGNService";
import { createCdcService } from "./special/cdc/factoryCDCService";
import { createPnService } from "./special/pn/factoryPn";
import { createFciService } from "./special/fci/factoryFCIService";

export const createServices = (
  national: number,
  local: number,
  specialServicesConfig: SpecialServicesConfig
): readonly ServicePublic[] => {
  const aggregation = 3;
  // services belong to the same organization for blocks of `aggregation` size
  // tslint:disable-next-line: no-let
  let organizationCount = 0;
  // tslint:disable-next-line: no-let
  let serviceIndex = 0;
  const createServices = (scope: ServiceScopeEnum, count: number) =>
    range(0, count - 1).map(_ => {
      organizationCount =
        serviceIndex !== 0 && serviceIndex % aggregation === 0
          ? organizationCount + 1
          : organizationCount;
      serviceIndex++;
      return {
        ...createService(`service${serviceIndex}`),
        organization_fiscal_code: `${organizationCount + 1}`.padStart(
          11,
          "0"
        ) as OrganizationFiscalCode,
        organization_name: `${faker.company.name()} [${organizationCount +
          1}]` as OrganizationName,
        service_metadata: {
          ...createServiceMetadata(scope),
          scope,
          cta: frontMatter2CTA2 as NonEmptyString
        }
      };
    });

  const nationalLocalServices: ReadonlyArray<ServicePublic> = [
    ...createServices(ServiceScopeEnum.LOCAL, local),
    ...createServices(ServiceScopeEnum.NATIONAL, national)
  ];
  // special service must be added at the end of services creation
  return appendSpecialServices(specialServicesConfig, nationalLocalServices);
};

const createService = (serviceId: string): ServicePublic => {
  const service = {
    department_name: "dev department name" as DepartmentName,
    organization_fiscal_code: "00514490010" as OrganizationFiscalCode,
    organization_name: "dev organization name" as OrganizationName,
    service_id: serviceId,
    service_name: `${faker.company.bs()}` as ServiceName,
    available_notification_channels: [
      NotificationChannelEnum.EMAIL,
      NotificationChannelEnum.WEBHOOK
    ],
    version: 1
  };
  return validatePayload(ServicePublic, service);
};

const createServiceMetadata = (
  scope: ServiceScopeEnum
): ServiceMetadata => {
  return {
    description: "demo demo <br/>demo demo <br/>demo demo <br/>demo demo <br/>" as NonEmptyString,
    scope,
    address: faker.address.streetAddress() as NonEmptyString,
    email: faker.internet.email() as NonEmptyString,
    pec: faker.internet.email() as NonEmptyString,
    phone: faker.phone.number() as NonEmptyString,
    web_url: faker.internet.url() as NonEmptyString,
    app_android: faker.internet.url() as NonEmptyString,
    app_ios: faker.internet.url() as NonEmptyString,
    tos_url: faker.internet.url() as NonEmptyString,
    privacy_url: faker.internet.url() as NonEmptyString,
    category: StandardServiceCategoryEnum.STANDARD
  };
};

const getOrganizationFiscalCode = (organizationsCount: number) =>
  `${organizationsCount}`.padStart(11, "0") as OrganizationFiscalCode;

// list of tuple where the first element is a flag indicating if the relative service should be included
// the second element is the service factory
const specialServicesFactory = (config: SpecialServicesConfig): ReadonlyArray<readonly [
  boolean,
  (
    createService: ((serviceId: string) => ServicePublic),
    createServiceMetadata: ((scope: ServiceScopeEnum) => ServiceMetadata), 
    organizationFiscalCode: OrganizationFiscalCode
  ) => ServicePublic
]> => [
  [config.siciliaVola, createSiciliaVolaService],
  [config.cgn, createCgnService],
  [config.cdc, createCdcService],
  [config.pn, createPnService],
  [config.fci, createFciService]
];

// eventually add the special services based on config flags
const appendSpecialServices = (
  specialServicesConfig: SpecialServicesConfig,
  services: ReadonlyArray<ServicePublic>
): ReadonlyArray<ServicePublic> =>
  specialServicesFactory(specialServicesConfig).reduce((acc, curr) => {
    if (curr[0]) {
      const organizationIds = new Set(acc.map(s => s.organization_fiscal_code));
      // tslint:disable-next-line: no-let
      let startId = organizationIds.size;
      // to avoid organizations fiscal code clash
      while (organizationIds.has(getOrganizationFiscalCode(startId))) {
        startId++;
      }
      const newOrganizationId = getOrganizationFiscalCode(startId);
      return [...acc, curr[1](createService, createServiceMetadata, newOrganizationId)];
    }
    return acc;
  }, services);