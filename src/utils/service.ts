import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { faker } from "@faker-js/faker/locale/it";
import { DepartmentName } from "../../generated/definitions/backend/DepartmentName";
import { NotificationChannelEnum } from "../../generated/definitions/backend/NotificationChannel";
import { OrganizationName } from "../../generated/definitions/backend/OrganizationName";
import { ServiceMetadata } from "../../generated/definitions/backend/ServiceMetadata";
import { ServiceName } from "../../generated/definitions/backend/ServiceName";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../generated/definitions/backend/ServiceScope";
import { StandardServiceCategoryEnum } from "../../generated/definitions/backend/StandardServiceCategory";
import { validatePayload } from "./validator";

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
