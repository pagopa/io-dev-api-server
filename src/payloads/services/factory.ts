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
import { frontMatter2CTA2 } from "../../utils/variables";

export const createLocalServices = (
  count: number, 
  serviceStartIndex: number, 
  aggregationCount = 3
) : ServicePublic[] => 
  createServices(ServiceScopeEnum.LOCAL, count, serviceStartIndex, aggregationCount);

export const createNationalServices = (
  count: number, 
  serviceStartIndex: number, 
  aggregationCount = 3
) : ServicePublic[] => 
  createServices(ServiceScopeEnum.NATIONAL, count, serviceStartIndex, aggregationCount);

export const createSpecialServices = (
  specialServiceGeneratorTuples: [boolean, SpecialServiceGenerator][], 
  serviceStartIndex: number, 
  aggregationCount = 3
) : ServicePublic[] => 
createSpecialServicesInternal(specialServiceGeneratorTuples, serviceStartIndex, aggregationCount);

const createServices = (
  scope: ServiceScopeEnum, 
  count: number, 
  serviceStartIndex: number, 
  aggregationCount: number
): ServicePublic[] => {
  const services: ServicePublic[] = [];
  for (let serviceIndex=serviceStartIndex; serviceIndex<count; serviceIndex++) {
    const organizationIndex = getOrganizationIndex(serviceIndex, aggregationCount);
    const service = {
      ...createService(`service${serviceIndex}`),
      organization_fiscal_code: `${organizationIndex}`.padStart(
        11,
        "0"
      ) as OrganizationFiscalCode,
      organization_name: `${faker.company.name()} [${organizationIndex}]` as OrganizationName,
      service_metadata: {
        ...createServiceMetadata(scope),
        scope,
        cta: frontMatter2CTA2 as NonEmptyString
      }
    };
    services.push(service);
  }
  return services;
}

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

const createSpecialServicesInternal = (specialServiceGeneratorTuples: [boolean, SpecialServiceGenerator][], serviceStartIndex: number, aggregationCount: number): ServicePublic[] => {
  
  let specialServices: ServicePublic[] = [];
  let organizationStartIndex = getOrganizationIndex(serviceStartIndex, aggregationCount);

  specialServiceGeneratorTuples.forEach(specialServiceGeneratorTuple => {
    const organizationFiscalCode = getOrganizationFiscalCode(organizationStartIndex);
    const isSpecialServiceEnabled = specialServiceGeneratorTuple[0];
    if (isSpecialServiceEnabled) {
      const specialServiceGenerator = specialServiceGeneratorTuple[1];
      const specialService = specialServiceGenerator(createService, createServiceMetadata, organizationFiscalCode);
      specialServices.push(specialService);
    }
    organizationStartIndex++;
  });
  return specialServices;
}

const getOrganizationIndex = (serviceIndex: number, aggregationCount: number) => 1 + Math.floor(serviceIndex / aggregationCount);

const getOrganizationFiscalCode = (organizationsCount: number) =>
  `${organizationsCount}`.padStart(11, "0") as OrganizationFiscalCode;

export type SpecialServiceGenerator = (
  createService: ((serviceId: string) => ServicePublic),
  createServiceMetadata: ((scope: ServiceScopeEnum) => ServiceMetadata), 
  organizationFiscalCode: OrganizationFiscalCode
) => ServicePublic;