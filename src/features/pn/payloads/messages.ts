/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-let */
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import { fakerIT as faker } from "@faker-js/faker";
import { CreatedMessageWithContentAndAttachments } from "../../../../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { IoDevServerConfig } from "../../../types/config";
import {
  pnOptInCTA,
  sendOptInServiceId,
  sendServiceId,
  sendServiceName
} from "../services/services";
import { getNewMessage } from "../../../populate-persistence";
import { initializeSENDRepositoriesIfNeeded } from "../repositories/utils";
import { NotificationRepository } from "../repositories/notificationRepository";
import {
  ioOrganizationFiscalCode,
  ioOrganizationName
} from "../../services/persistence/services/factory";
import { validatePayload } from "../../../utils/validator";
import { HasPreconditionEnum } from "../../../../generated/definitions/backend/HasPrecondition";
import { nextMessageIdAndCreationDate } from "../../messages/utils";

export const createSENDOptInMessage = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] =>
  pipe(
    customConfig.send.sendOptInMessage,
    B.fold(
      () => [],
      () => [
        getNewMessage(
          customConfig,
          `Hai una comunicazione a valore legale da SEND`,
          pnOptInCTA +
            "\nCiao,\n\nhai ricevuto una **notifica SEND**, cioè una comunicazione a valore legale emessa da un'amministrazione.\n\nPer leggere la notifica in app, **attiva il servizio SEND entro 5 giorni**: eviterai una raccomandata e i relativi costi.\n\nSe attivi il servizio dopo, dovrai consultare questa comunicazione tramite altri canali, ma riceverai in app le notifiche SEND future.\n\nPremendo “Attiva per leggere la notifica” accetti i **[Termini e condizioni d’uso](https://cittadini.notifichedigitali.it/termini-di-servizio)** e confermi di avere letto l’**[Informativa privacy](https://cittadini.notifichedigitali.it/informativa-privacy)**.",
          undefined,
          sendOptInServiceId
        )
      ]
    )
  );

export const createSENDMessagesOnIO = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] => {
  initializeSENDRepositoriesIfNeeded();

  const sendMessagesOnIO: CreatedMessageWithContentAndAttachments[] = [];

  const sendMessagesConfiguration = customConfig.send.sendMessages;
  for (const { iun, ioTitle } of sendMessagesConfiguration) {
    const notification = NotificationRepository.getNotification(iun);
    if (notification == null) {
      // eslint-disable-next-line no-console
      console.warn(
        `An IO message for a SEND notification has been created but such Notification does not exist on SEND (iun: ${iun})`
      );
    }

    const { id, created_at } = nextMessageIdAndCreationDate();
    const hasAttachments = (notification?.attachments?.length ?? 0) > 0;
    const sendMessageOnIO = validatePayload(
      CreatedMessageWithContentAndAttachments,
      {
        category: {
          id: iun,
          tag: "PN"
        },
        content: {
          subject:
            ioTitle ?? faker.word.words(faker.number.int({ min: 3, max: 5 })),
          markdown:
            "This markdown is not used but it has to be at least eighty characters long to pass",
          third_party_data: {
            id: iun,
            has_attachments: hasAttachments,
            has_remote_content: true,
            has_precondition: HasPreconditionEnum.ALWAYS
          }
        },
        created_at,
        fiscal_code: customConfig.profile.attrs.fiscal_code,
        has_attachments: hasAttachments,
        has_precondition: true,
        id,
        is_archived: false,
        is_read: false,
        organization_fiscal_code: ioOrganizationFiscalCode,
        organization_name: ioOrganizationName,
        message_title: notification?.subject ?? "This message has no title",
        sender_service_id: sendServiceId,
        service_name: sendServiceName
      }
    );
    sendMessagesOnIO.push(sendMessageOnIO);
  }

  return sendMessagesOnIO;
};
