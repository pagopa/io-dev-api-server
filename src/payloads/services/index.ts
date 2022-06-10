import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "italia-ts-commons/lib/strings";
import { OrganizationName } from "../../../generated/definitions/backend/OrganizationName";
import { PaginatedServiceTupleCollection } from "../../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServiceId } from "../../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../../generated/definitions/backend/ServicePreference";
import { ServicePublic } from "../../../generated/definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../generated/definitions/backend/ServiceScope";
import { SpecialServiceMetadata } from "../../../generated/definitions/backend/SpecialServiceMetadata";
import { ioDevServerConfig } from "../../config";
import { isCgnActivated } from "../../routers/features/cgn";
import { getRandomValue } from "../../utils/random";
import { getService, getServiceMetadata } from "../../utils/service";
import { validatePayload } from "../../utils/validator";
import { frontMatter2CTA2 } from "../../utils/variables";
import { IOResponse } from "../response";
import { withSpecialServices } from "./special";

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
  // special service must be added at the end of services creation
  return withSpecialServices(nationalLocalServices);
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

const specialServicesPreferenceFactory: Map<string, () => boolean> = new Map<
  string,
  () => boolean
>([["cgn", isCgnActivated]]);

export const getServicesPreferences = (
  services: ReadonlyArray<ServicePublic>
) =>
  new Map<ServiceId, ServicePreference>(
    services.map(s => {
      const metadata = s.service_metadata;
      if (metadata && SpecialServiceMetadata.is(metadata)) {
        const hasSpecialServiceInbox = pipe(
          O.fromNullable(metadata.custom_special_flow),
          O.fold(
            () => false,
            csf =>
              pipe(
                O.fromNullable(specialServicesPreferenceFactory.get(csf)),
                O.fold(
                  () => false,
                  h => h()
                )
              )
          )
        );

        return [
          s.service_id,
          {
            is_inbox_enabled: hasSpecialServiceInbox,
            is_email_enabled: hasSpecialServiceInbox
              ? getRandomValue(false, faker.datatype.boolean(), "services")
              : false,
            is_webhook_enabled: hasSpecialServiceInbox
              ? getRandomValue(false, faker.datatype.boolean(), "services")
              : false,
            can_access_message_read_status: hasSpecialServiceInbox
              ? getRandomValue(false, faker.datatype.boolean(), "services")
              : false,
            settings_version: 0 as ServicePreference["settings_version"]
          }
        ];
      }
      const isInboxEnabled = faker.datatype.boolean();
      return [
        s.service_id,
        {
          is_inbox_enabled: isInboxEnabled,
          is_email_enabled: isInboxEnabled ? faker.datatype.boolean() : false,
          is_webhook_enabled: isInboxEnabled ? faker.datatype.boolean() : false,
          can_access_message_read_status: isInboxEnabled
            ? faker.datatype.boolean()
            : false,
          settings_version: 0 as ServicePreference["settings_version"]
        }
      ];
    })
  );
