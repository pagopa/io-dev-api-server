import { range } from "fp-ts/lib/Array";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { DepartmentName } from "../../generated/definitions/backend/DepartmentName";
import { NotificationChannelEnum } from "../../generated/definitions/backend/NotificationChannel";
import { OrganizationName } from "../../generated/definitions/backend/OrganizationName";
import { PaginatedServiceTupleCollection } from "../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServiceName } from "../../generated/definitions/backend/ServiceName";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import {
  ScopeEnum,
  Service
} from "../../generated/definitions/content/Service";
import { ServicesByScope } from "../../generated/definitions/content/ServicesByScope";
import { validatePayload } from "../utils/validator";
import { frontMatterMyPortal } from "../utils/variables";
import { IOResponse } from "./response";

export const getService = (serviceId: string): ServicePublic => {
  const service = {
    department_name: "dev department name" as DepartmentName,
    organization_fiscal_code: "00514490010" as OrganizationFiscalCode,
    organization_name: "dev organization name" as OrganizationName,
    service_id: serviceId,
    service_name: `mock service [${serviceId}]` as ServiceName,
    available_notification_channels: [
      NotificationChannelEnum.EMAIL,
      NotificationChannelEnum.WEBHOOK
    ],
    version: 1
  };
  return validatePayload(ServicePublic, service);
};

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
      ...getService(`dev-service_${idx}`),
      organization_fiscal_code: `${organizationCount + 1}`.padStart(
        11,
        "0"
      ) as OrganizationFiscalCode,
      organization_name: `organization name_${organizationCount +
        1}` as OrganizationName
    };
  });
};

export const getServicesTuple = (
  services: readonly ServicePublic[]
): IOResponse<PaginatedServiceTupleCollection> => {
  const items = services.map(s => {
    return {
      service_id: s.service_id,
      version: s.version
    };
  });
  const payload = validatePayload(PaginatedServiceTupleCollection, {
    items,
    page_size: items.length
  });
  return { payload, isJson: true };
};

export const getServicesByScope = (
  services: readonly ServicePublic[]
): IOResponse<ServicesByScope> => {
  // first half -> LOCAL
  // second half -> NATIONAL
  const servicesByScope = { NATIONAL: Array<string>(), LOCAL: Array<string>() };
  services.forEach((s, idx) => {
    // tslint:disable-next-line: no-let
    let serviceScope: ScopeEnum = ScopeEnum.NATIONAL;
    if (idx + 1 <= services.length * 0.5) {
      serviceScope = ScopeEnum.LOCAL;
    }
    servicesByScope[serviceScope].push(s.service_id);
  });
  return {
    payload: validatePayload(ServicesByScope, servicesByScope),
    isJson: true
  };
};

export const getServiceMetadata = (
  serviceId: string,
  services: PaginatedServiceTupleCollection
): IOResponse<Service> => {
  const serviceIndex = services.items.findIndex(
    s => s.service_id === serviceId
  );
  // tslint:disable-next-line: no-let
  let serviceScope: ScopeEnum = ScopeEnum.NATIONAL;
  // first half -> LOCAL
  // second half -> NATIONAL
  if (serviceIndex + 1 <= services.items.length * 0.5) {
    serviceScope = ScopeEnum.LOCAL;
  }
  const metaData: Service = {
    description: "demo demo <br/>demo demo <br/>demo demo <br/>demo demo <br/>",
    scope: serviceScope,
    address: "Piazza di Spagna, Roma, Italia",
    email: "mock.service@email.com",
    pec: "mock.pec@email.com",
    phone: "5555555",
    web_url: "https://www.google.com",
    app_android: "https://www.google.com",
    app_ios: "https://www.google.com",
    support_url: "https://www.sos.com",
    tos_url: "https://www.tos.com",
    privacy_url: "https://www.privacy.com",
    token_name: "myPortalToken",
    cta: frontMatterMyPortal
  };
  return { payload: validatePayload(Service, metaData), isJson: true };
};
