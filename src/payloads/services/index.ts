import { faker } from "@faker-js/faker/locale/it";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PaginatedServiceTupleCollection } from "../../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServiceId } from "../../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../../generated/definitions/backend/ServicePreference";
import { ServicePublic } from "../../../generated/definitions/backend/ServicePublic";
import { SpecialServiceMetadata } from "../../../generated/definitions/backend/SpecialServiceMetadata";
import { isCgnActivated } from "../../routers/features/cgn";
import { getRandomValue } from "../../utils/random";
import { validatePayload } from "../../utils/validator";
import { IOResponse } from "../response";



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
