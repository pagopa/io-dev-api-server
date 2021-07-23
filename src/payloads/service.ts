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
  frontMatter1CTABonusBpd,
  frontMatter1CTABonusCgn,
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

export const siciliaVolaServiceId = "serviceSv";
const siciliaVolaService: ServicePublic = {
  ...getService(siciliaVolaServiceId),
  organization_fiscal_code: "18".padStart(11, "0") as OrganizationFiscalCode,
  organization_name: "Sicilia Vola" as OrganizationName,
  service_name: "Sicilia Vola" as ServiceName,
  service_metadata: {
    scope: ServiceScopeEnum.NATIONAL
  },
  version: 1
};

export const withSiciliaVolaService = (
  services: readonly ServicePublic[]
): readonly ServicePublic[] => services.concat(siciliaVolaService);

export const getServices = (count: number): readonly ServicePublic[] => {
  const aggregation = 3;
  // services belong to the same organization for blocks of `aggregation` size
  // tslint:disable-next-line: no-let
  let organizationCount = 0;
  return range(0, count - 1).map(idx => {
    organizationCount =
      idx !== 0 && idx % aggregation === 0
        ? organizationCount + 1
        : organizationCount;
    // first half have organization_fiscal_code === organizationFiscalCodes[0]
    // second half have organization_fiscal_code === organizationFiscalCodes[1]
    return {
      ...getService(`service${idx}`),
      organization_fiscal_code: `${organizationCount + 1}`.padStart(
        11,
        "0"
      ) as OrganizationFiscalCode,
      organization_name: `${faker.company.companyName()} [${organizationCount +
        1}]` as OrganizationName,
      service_metadata: {
        scope:
          idx + 1 <= count * 0.5
            ? ServiceScopeEnum.LOCAL
            : ServiceScopeEnum.NATIONAL,
        cta: frontMatter2CTA2 as NonEmptyString
      }
    };
  });
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

export const getServiceMetadata = (
  serviceId: string,
  services: PaginatedServiceTupleCollection
): IOResponse<ServicePublicService_metadata> => {
  const serviceIndex = services.items.findIndex(
    s => s.service_id === serviceId
  );
  // tslint:disable-next-line: no-let
  let serviceScope: ServiceScopeEnum = ServiceScopeEnum.NATIONAL;
  // first half -> LOCAL
  // second half -> NATIONAL
  if (serviceIndex + 1 <= services.items.length * 0.5) {
    serviceScope = ServiceScopeEnum.LOCAL;
  }

  const metaData: ServicePublicService_metadata = {
    description: "demo demo <br/>demo demo <br/>demo demo <br/>demo demo <br/>" as NonEmptyString,
    scope: serviceScope,
    address: "Piazza di Spagna, Roma, Italia" as NonEmptyString,
    email: "mock.service@email.com" as NonEmptyString,
    pec: "mock.pec@email.com" as NonEmptyString,
    phone: "5555555" as NonEmptyString,
    web_url: "https://www.google.com" as NonEmptyString,
    app_android: "https://www.google.com" as NonEmptyString,
    app_ios: "https://www.google.com" as NonEmptyString,
    tos_url: "https://www.tos.com" as NonEmptyString,
    privacy_url: "https://www.privacy.com" as NonEmptyString,
    cta:
      serviceId.split(".")[0] === siciliaVolaServiceId.toLocaleLowerCase()
        ? (frontMatter1CTASiciliaVola as NonEmptyString)
        : undefined
  };
  return {
    payload: validatePayload(ServicePublicService_metadata, metaData),
    isJson: true
  };
};

export const getServicesPreferences = (
  services: ReadonlyArray<ServicePublic>
) =>
  new Map<ServiceId, ServicePreference>(
    services.map(s => {
      const isInboxEnabled = faker.random.boolean();
      return [
        s.service_id,
        {
          is_inbox_enabled: isInboxEnabled,
          is_email_enabled: isInboxEnabled ? faker.random.boolean() : false,
          is_webhook_enabled: isInboxEnabled ? faker.random.boolean() : false,
          settings_version: 0 as ServicePreference["settings_version"]
        }
      ];
    })
  );
