import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "italia-ts-commons/lib/strings";
import { DepartmentName } from "../../../generated/definitions/backend/DepartmentName";
import { NotificationChannelEnum } from "../../../generated/definitions/backend/NotificationChannel";
import { OrganizationName } from "../../../generated/definitions/backend/OrganizationName";
import { PaginatedServiceTupleCollection } from "../../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServiceId } from "../../../generated/definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../generated/definitions/backend/ServiceMetadata";
import { ServiceName } from "../../../generated/definitions/backend/ServiceName";
import { ServicePreference } from "../../../generated/definitions/backend/ServicePreference";
import { ServicePublic } from "../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../generated/definitions/backend/ServiceScope";
import { SpecialServiceCategoryEnum } from "../../../generated/definitions/backend/SpecialServiceCategory";
import { SpecialServiceMetadata } from "../../../generated/definitions/backend/SpecialServiceMetadata";
import { StandardServiceCategoryEnum } from "../../../generated/definitions/backend/StandardServiceCategory";
import { ioDevServerConfig } from "../../config";
import { validatePayload } from "../../utils/validator";
import {
  frontMatter1CTASiciliaVola,
  frontMatter2CTA2
} from "../../utils/variables";
import { IOResponse } from "../response";
import { specialServices } from "./special";

export const getService = (serviceId: string): ServicePublic => {
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

export const getServiceMetadata = (
  scope: ServiceScopeEnum
): ServiceMetadata => {
  return {
    description: "demo demo <br/>demo demo <br/>demo demo <br/>demo demo <br/>" as NonEmptyString,
    scope,
    address: faker.address.streetAddress() as NonEmptyString,
    email: faker.internet.email() as NonEmptyString,
    pec: faker.internet.email() as NonEmptyString,
    phone: faker.phone.phoneNumber() as NonEmptyString,
    web_url: faker.internet.url() as NonEmptyString,
    app_android: faker.internet.url() as NonEmptyString,
    app_ios: faker.internet.url() as NonEmptyString,
    tos_url: faker.internet.url() as NonEmptyString,
    privacy_url: faker.internet.url() as NonEmptyString,
    category: StandardServiceCategoryEnum.STANDARD
  };
};

export const getServices = (
  national: number,
  local: number
): readonly ServicePublic[] => {
  const aggregation = 3;
  // services belong to the same organization for blocks of `aggregation` size
  // tslint:disable-next-line: no-let
  let organizationCount = 0;
  // tslint:disable-next-line: no-let
  let serviceIndex = 0;
  const createService = (scope: ServiceScopeEnum, count: number) =>
    range(0, count - 1).map(_ => {
      organizationCount =
        serviceIndex !== 0 && serviceIndex % aggregation === 0
          ? organizationCount + 1
          : organizationCount;
      serviceIndex++;
      return {
        ...getService(`service${serviceIndex}`),
        organization_fiscal_code: `${organizationCount + 1}`.padStart(
          11,
          "0"
        ) as OrganizationFiscalCode,
        organization_name: `${faker.company.companyName()} [${organizationCount +
          1}]` as OrganizationName,
        service_metadata: {
          ...getServiceMetadata(scope),
          scope,
          cta: frontMatter2CTA2 as NonEmptyString
        }
      };
    });

  const nationalLocalServices: ReadonlyArray<ServicePublic> = [
    ...createService(ServiceScopeEnum.LOCAL, local),
    ...createService(ServiceScopeEnum.NATIONAL, national)
  ];

  // eventually add the special services based on config flag
  return specialServices.reduce((acc, curr) => {
    if (curr[0]) {
      return [...acc, curr[1](acc.length)];
    }
    return acc;
  }, nationalLocalServices);
};

export const getServicesTuple = (
  services: readonly ServicePublic[]
): IOResponse<PaginatedServiceTupleCollection> => {
  const items = services.map(s => {
    return {
      service_id: s.service_id,
      version: s.version,
      scope: s.service_metadata?.scope
    };
  });
  const payload = validatePayload(PaginatedServiceTupleCollection, {
    items,
    page_size: items.length
  });
  return { payload, isJson: true };
};

export const getServicesPreferences = (
  services: ReadonlyArray<ServicePublic>
) =>
  new Map<ServiceId, ServicePreference>(
    services.map(s => {
      const isInboxEnabled = faker.datatype.boolean();
      return [
        s.service_id,
        {
          is_inbox_enabled: isInboxEnabled,
          is_email_enabled: isInboxEnabled ? faker.datatype.boolean() : false,
          is_webhook_enabled: isInboxEnabled ? faker.datatype.boolean() : false,
          settings_version: 0 as ServicePreference["settings_version"]
        }
      ];
    })
  );
