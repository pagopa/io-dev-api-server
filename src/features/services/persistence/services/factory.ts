import * as A from "fp-ts/lib/Array";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { fakerIT as faker } from "@faker-js/faker";
import { validatePayload } from "../../../../utils/validator";
import { frontMatter2CTA2 } from "../../../../utils/variables";
import { ServiceId } from "../../../../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../../../../generated/definitions/backend/ServicePreference";
import { getRandomValue } from "../../../../utils/random";
import { ServiceDetails } from "../../../../../generated/definitions/services/ServiceDetails";
import { StandardServiceCategoryEnum } from "../../../../../generated/definitions/services/StandardServiceCategory";
import { ScopeTypeEnum } from "../../../../../generated/definitions/services/ScopeType";
import { ServiceMetadata } from "../../../../../generated/definitions/services/ServiceMetadata";

const createLocalServices = (
  count: number,
  serviceStartIndex: number,
  aggregationCount = 3
): ServiceDetails[] =>
  createServices(
    ScopeTypeEnum.LOCAL,
    count,
    serviceStartIndex,
    aggregationCount
  );

const createNationalServices = (
  count: number,
  serviceStartIndex: number,
  aggregationCount = 3
): ServiceDetails[] =>
  createServices(
    ScopeTypeEnum.NATIONAL,
    count,
    serviceStartIndex,
    aggregationCount
  );

const createSpecialServices = (
  specialServiceGeneratorTuples: Array<[boolean, SpecialServiceGenerator]>,
  serviceStartIndex: number,
  aggregationCount = 3
): ServiceDetails[] =>
  createSpecialServicesInternal(
    specialServiceGeneratorTuples,
    serviceStartIndex,
    aggregationCount
  );

const createServicePreferenceSource = (
  serviceId: ServiceId,
  isSpecialService: boolean = false
): ServicePreferenceSource => ({
  serviceId,
  isSpecialService
});

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
  scope: ScopeTypeEnum,
  count: number,
  serviceStartIndex: number,
  aggregationCount: number
): ServiceDetails[] =>
  A.makeBy(count, index => {
    const serviceIndex = index + serviceStartIndex;

    const organizationIndex = getOrganizationIndex(
      serviceIndex,
      aggregationCount
    );

    return {
      ...createServiceFromFactory(`service${serviceIndex + 1}`),
      organization: {
        fiscal_code: `${organizationIndex}`.padStart(
          11,
          "0"
        ) as OrganizationFiscalCode,
        name: `${faker.company.name()} [${organizationIndex}]` as NonEmptyString
      },
      metadata: {
        ...createServiceMetadataFromFactory(scope),
        scope,
        cta: frontMatter2CTA2 as NonEmptyString
      }
    };
  });

export const createServiceFromFactory = (serviceId: string): ServiceDetails => {
  const service = {
    description: "demo demo <br/>demo demo <br/>demo demo <br/>demo demo <br/>",
    id: serviceId,
    metadata: {
      category: StandardServiceCategoryEnum.STANDARD,
      scope: ScopeTypeEnum.LOCAL
    },
    name: `${faker.company.buzzPhrase()}`,
    organization: {
      fiscal_code: "00514490010" as OrganizationFiscalCode,
      name: "dev organization name" as NonEmptyString
    }
  };
  return validatePayload(ServiceDetails, service);
};

export const createServiceMetadataFromFactory = (
  scope: ScopeTypeEnum
): ServiceMetadata => ({
  scope,
  address: faker.location.streetAddress() as NonEmptyString,
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
): ServiceDetails[] => {
  const organizationStartIndex =
    getOrganizationIndex(serviceStartIndex, aggregationCount) +
    (serviceStartIndex % aggregationCount !== 0 ? 1 : 0);

  return specialServiceGeneratorTuples.reduce(
    (
      acc: ServiceDetails[],
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
            createServiceFromFactory,
            createServiceMetadataFromFactory,
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
  createService: (serviceId: string) => ServiceDetails,
  createServiceMetadata: (scope: ScopeTypeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
) => ServiceDetails;

export type ServicePreferenceSource = {
  serviceId: ServiceId;
  isSpecialService: boolean;
};

export default {
  createLocalServices,
  createNationalServices,
  createServicePreferenceSource,
  createServicePreferences,
  createSpecialServices
};
