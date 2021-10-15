import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "italia-ts-commons/lib/strings";
import { DepartmentName } from "../../generated/definitions/backend/DepartmentName";
import { NotificationChannelEnum } from "../../generated/definitions/backend/NotificationChannel";
import { OrganizationName } from "../../generated/definitions/backend/OrganizationName";
import { PaginatedServiceTupleCollection } from "../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServiceId } from "../../generated/definitions/backend/ServiceId";
import { ServiceName } from "../../generated/definitions/backend/ServiceName";
import { ServicePreference } from "../../generated/definitions/backend/ServicePreference";
import {
  ServicePublic,
  ServicePublicService_metadata
} from "../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../generated/definitions/backend/ServiceScope";
import { validatePayload } from "../utils/validator";
import {
  frontMatter1CTASiciliaVola,
  frontMatter2CTA2
} from "../utils/variables";
import { IOResponse } from "./response";

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

const getServiceMetadata = (
  scope: ServiceScopeEnum
): ServicePublicService_metadata => {
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
    privacy_url: faker.internet.url() as NonEmptyString
  };
};

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

export const withSiciliaVolaService = (
  services: readonly ServicePublic[]
): readonly ServicePublic[] => {
  const organizationsCount = new Set(
    services.map(s => s.organization_fiscal_code)
  ).size;
  return services.concat({
    ...siciliaVolaService,
    organization_fiscal_code: `${organizationsCount + 1}`.padStart(
      11,
      "0"
    ) as OrganizationFiscalCode
  });
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
  return [
    ...createService(ServiceScopeEnum.LOCAL, local),
    ...createService(ServiceScopeEnum.NATIONAL, national)
  ];
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
