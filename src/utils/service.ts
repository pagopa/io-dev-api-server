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

