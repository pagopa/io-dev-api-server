import * as A from "fp-ts/lib/Array";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { faker } from "@faker-js/faker/locale/it";
import { ServicePublic } from "../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../generated/definitions/backend/ServiceScope";
import { OrganizationName } from "../../../generated/definitions/backend/OrganizationName";
import { DepartmentName } from "../../../generated/definitions/backend/DepartmentName";
import { ServiceName } from "../../../generated/definitions/backend/ServiceName";
import { NotificationChannelEnum } from "../../../generated/definitions/backend/NotificationChannel";
import { validatePayload } from "../../utils/validator";
import { ServiceMetadata } from "../../../generated/definitions/backend/ServiceMetadata";
import { StandardServiceCategoryEnum } from "../../../generated/definitions/backend/StandardServiceCategory";
import { frontMatter2CTA2 } from "../../utils/variables";
import { ServiceId } from "../../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../../generated/definitions/backend/ServicePreference";
import { getRandomValue } from "../../utils/random";

const createLocalServices = (
  count: number,
  serviceStartIndex: number,
  aggregationCount = 3
): ServicePublic[] =>
  createServices(
    ServiceScopeEnum.LOCAL,
    count,
    serviceStartIndex,
    aggregationCount
  );

const createNationalServices = (
  count: number,
  serviceStartIndex: number,
  aggregationCount = 3
): ServicePublic[] =>
  createServices(
    ServiceScopeEnum.NATIONAL,
    count,
    serviceStartIndex,
    aggregationCount
  );

const createSpecialServices = (
  specialServiceGeneratorTuples: Array<[boolean, SpecialServiceGenerator]>,
  serviceStartIndex: number,
  aggregationCount = 3
): ServicePublic[] =>
  createSpecialServicesInternal(
    specialServiceGeneratorTuples,
    serviceStartIndex,
    aggregationCount
  );

const createServicePreferenceSource = (
  serviceId: ServiceId,
  isSpecialService: boolean = false
): ServicePreferenceSource =>
  ({
    serviceId,
    isSpecialService
  } as ServicePreferenceSource);

const createServicePreferences = (
  servicesSources: ReadonlyArray<ServicePreferenceSource>,
  customPreferenceEnabledGenerators: Map<ServiceId, () => boolean>
) => {
  const servicePreferences = new Map<ServiceId, ServicePreference>();
  servicesSources.forEach(serviceSource => {
    const serviceId = serviceSource.serviceId;
    const serviceHasCustomPreferenceGenerator =
      customPreferenceEnabledGenerators.get(serviceId);
    const isPreferenceEnabled =
      serviceSource.isSpecialService && serviceHasCustomPreferenceGenerator
        ? serviceHasCustomPreferenceGenerator()
        : faker.datatype.boolean();
    const preferenceGenerator = (
      shouldUseServicesConfigForRandomValues: boolean
    ) =>
      shouldUseServicesConfigForRandomValues
        ? getRandomValue(false, faker.datatype.boolean(), "services")
        : faker.datatype.boolean();

    servicePreferences.set(serviceId, {
      is_inbox_enabled: isPreferenceEnabled,
      is_email_enabled: isPreferenceEnabled
        ? preferenceGenerator(serviceHasCustomPreferenceGenerator !== undefined)
        : false,
      is_webhook_enabled: isPreferenceEnabled
        ? preferenceGenerator(serviceHasCustomPreferenceGenerator !== undefined)
        : false,
      can_access_message_read_status: isPreferenceEnabled
        ? preferenceGenerator(serviceHasCustomPreferenceGenerator !== undefined)
        : false,
      settings_version: 0 as ServicePreference["settings_version"]
    });
  });

  return servicePreferences;
};

const createServices = (
  scope: ServiceScopeEnum,
  count: number,
  serviceStartIndex: number,
  aggregationCount: number
): ServicePublic[] =>
  A.makeBy(count, index => {
    const serviceIndex = index + serviceStartIndex;

    const organizationIndex = getOrganizationIndex(
      serviceIndex,
      aggregationCount
    );

    return {
      ...createService(`service${serviceIndex + 1}`),
      organization_fiscal_code: `${organizationIndex}`.padStart(
        11,
        "0"
      ) as OrganizationFiscalCode,
      organization_name:
        `${faker.company.name()} [${organizationIndex}]` as OrganizationName,
      service_metadata: {
        ...createServiceMetadata(scope),
        scope,
        cta: frontMatter2CTA2 as NonEmptyString
      }
    };
  });

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

const createServiceMetadata = (scope: ServiceScopeEnum): ServiceMetadata => ({
  description:
    "demo demo <br/>demo demo <br/>demo demo <br/>demo demo <br/>" as NonEmptyString,
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
});

const createSpecialServicesInternal = (
  specialServiceGeneratorTuples: Array<[boolean, SpecialServiceGenerator]>,
  serviceStartIndex: number,
  aggregationCount: number
): ServicePublic[] => {
  const organizationStartIndex =
    getOrganizationIndex(serviceStartIndex, aggregationCount) +
    (serviceStartIndex % aggregationCount !== 0 ? 1 : 0);

  return specialServiceGeneratorTuples.reduce(
    (
      acc: ServicePublic[],
      [isSpecialServiceEnabled, specialServiceGenerator],
      index
    ) => {
      if (isSpecialServiceEnabled) {
        const organizationFiscalCode = getOrganizationFiscalCode(
          organizationStartIndex + index
        );

        return [
          ...acc,
          specialServiceGenerator(
            createService,
            createServiceMetadata,
            organizationFiscalCode
          )
        ];
      }

      return acc;
    },
    []
  );
};

const getOrganizationIndex = (serviceIndex: number, aggregationCount: number) =>
  1 + Math.floor(serviceIndex / aggregationCount);

const getOrganizationFiscalCode = (organizationsCount: number) =>
  `${organizationsCount}`.padStart(11, "0") as OrganizationFiscalCode;

export type SpecialServiceGenerator = (
  createService: (serviceId: string) => ServicePublic,
  createServiceMetadata: (scope: ServiceScopeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
) => ServicePublic;

export type ServicePreferenceSource = {
  serviceId: ServiceId;
  isSpecialService: boolean;
};

export default {
  createServicePreferenceSource,
  createServicePreferences,
  createLocalServices,
  createNationalServices,
  createSpecialServices
};
