import { range } from "fp-ts/lib/Array";

import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { getRandomIntInRange, getRandomStringId } from "../../src/utils/id";
import { validatePayload } from "../../src/utils/validator";
import { IOResponse } from "./response";

const messageMarkdown = `
# blocco1 

  ## blocco2 

  ### blocco3 

  #### blocco4

  Test list: 
  - item1
  - item2 
  - item3 
  - item4 
  - item5 
  - item6 
  
È universalmente **riconosciuto** che un _lettore_ che **osserva** il layout di una pagina viene distratto dal contenuto testuale se questo è leggibile. Lo scopo dell’utilizzo del Lorem Ipsum è che offre una normale distribuzione delle lettere (al contrario di quanto avviene se si utilizzano brevi frasi ripetute, ad esempio “testo qui”), apparendo come un normale blocco di testo leggibile. Molti software di impaginazione e di web design utilizzano Lorem Ipsum come testo modello. Molte versioni del testo sono state prodotte negli anni, a volte casualmente, a volte di proposito (ad esempio inserendo passaggi ironici).

### link esterni

[LINK ESTERNO GOOGLE](https://www.google.it)

[LINK CORROTTO](google.it)

### link interni

[MESSAGES_HOME](ioit://MESSAGES_HOME)

[PROFILE_PREFERENCES_HOME](ioit://PROFILE_PREFERENCES_HOME)

[SERVICES_HOME](ioit://SERVICES_HOME)

[PROFILE_MAIN](ioit://PROFILE_MAIN)

[PROFILE_PRIVACY](ioit://PROFILE_PRIVACY)

[PROFILE_PRIVACY_MAIN](ioit://PROFILE_PRIVACY_MAIN)

[WALLET_HOME](ioit://WALLET_HOME)

[WALLET_LIST](ioit://WALLET_LIST)

[PAYMENTS_HISTORY_SCREEN](ioit://PAYMENTS_HISTORY_SCREEN)`;

/**
 * generate a list containg count messages with the given fiscal_code
 * @param count the number of messages to generate
 * @param fiscal_code
 */
const createMessage = (
  count: number,
  fiscalCode: string,
  randomId: boolean = false,
  messageId?: string
) => {
  return range(1, count).map(idx => {
    const date = new Date();
    const msgId =
      randomId === true
        ? getRandomStringId()
        : messageId
        ? messageId
        : `${idx}`.padStart(26, "0");
    // all messages have a created_at 1 month different from each other
    const dueDate = date.setMonth(date.getMonth() + (idx - 3));
    return {
      created_at: new Date(dueDate).toISOString(),
      fiscal_code: fiscalCode,
      id: msgId,
      sender_service_id: `dev-service_${idx}`,
      time_to_live: 3600
    };
  });
};

const createMessageWithContent = (
  fiscalCode: string,
  serviceId: string,
  includePaymentData: boolean,
  invalidAfterDueDate: boolean,
  messageId?: string,
  dueDate?: Date,
  amount?: number
) => {
  const msgId = messageId || getRandomStringId(26);
  const date = dueDate;
  const paymentData =
    includePaymentData === true
      ? {
          amount: amount || getRandomIntInRange(1, 10000),
          notice_number: "012345678912345678" as PaymentNoticeNumber,
          invalid_after_due_date: invalidAfterDueDate
        }
      : undefined;
  return {
    content: {
      subject: `subject [${serviceId}]`,
      markdown: messageMarkdown,
      due_date: date,
      payment_data: paymentData
    },
    created_at: date || new Date(),
    fiscal_code: fiscalCode,
    id: msgId,
    sender_service_id: serviceId,
    time_to_live: 3600
  };
};

/**
 * return a list of count messages without content
 * @param count the number of messages
 * @param randomId if true a random if will be generated
 * @param fiscalCode the receiver fiscal code
 */
export const createMessageList = (
  count: number,
  randomId: boolean,
  fiscalCode: string
): PaginatedCreatedMessageWithoutContentCollection =>
  validatePayload(PaginatedCreatedMessageWithoutContentCollection, {
    items: createMessage(count, fiscalCode, randomId),
    page_size: count
  });

/**
 * return a message without content
 * @param messageId the id of the message to be created
 * @param fiscalCode the receiver fiscal code
 */
export const getMessage = (
  messageId: string,
  fiscalCode: string
): IOResponse<CreatedMessageWithoutContent> => {
  return {
    payload: validatePayload(
      CreatedMessageWithoutContent,
      createMessage(1, fiscalCode, false, messageId)[0]
    )
  };
};

/**
 * return a message with content
 * @param messageId the id of the message to be created
 * @param serviceId the id of the message service sender
 * @param fiscalCode the receiver fiscal code
 */
export const getMessageWithContent = (
  fiscalCode: string,
  serviceId: string,
  messageId: string,
  includePaymentData: boolean = true,
  invalidAfterDueDate: boolean = false,
  dueDate?: Date,
  amount?: number
): IOResponse<CreatedMessageWithContent> => {
  return {
    payload: validatePayload(
      CreatedMessageWithContent,
      createMessageWithContent(
        fiscalCode,
        serviceId,
        includePaymentData,
        invalidAfterDueDate,
        messageId,
        dueDate,
        amount
      )
    )
  };
};

/**
 * return a list containing count messages
 * @param count the number of message to generate
 * @param randomId if true a random id is generated, a fixed one otherwise
 */
export const getMessageWithoutContentList = (
  count: number,
  services: readonly ServicePublic[],
  fiscalCode: string,
  randomId: boolean = false
): IOResponse<PaginatedCreatedMessageWithoutContentCollection> => {
  const list = createMessageList(count, randomId, fiscalCode);
  return {
    payload: {
      ...list,
      items: list.items.map((m, idx) => {
        return {
          ...m,
          sender_service_id: services[idx % services.length].service_id
        };
      })
    },
    isJson: true
  };
};

// 404 - message NOT found
export const messagesResponseNotFound: IOResponse<string> = {
  payload: "not found",
  isJson: false,
  status: 404
};
