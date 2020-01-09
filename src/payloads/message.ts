import { range } from "fp-ts/lib/Array";

import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { getRandomStringId, getRandomIntInRange } from "../../src/utils/id";
import { validatePayload } from "../../src/utils/validator";
import { IOResponse } from "./response";

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
    const dueDate = date.setMonth(date.getMonth() + (idx - 1));
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
  messageId?: string,
  dueDate?: Date,
  amount?: number
) => {
  const msgId = messageId || getRandomStringId(26);
  const date = dueDate || new Date();
  return {
    content: {
      subject: `subject [${serviceId}]`,
      markdown:
        "😊 this is a mock message this is a mock message this is a mock message this is a mock message",
      due_date: date,
      payment_data: {
        amount: amount || getRandomIntInRange(1, 10000),
        notice_number: "012345678912345678" as PaymentNoticeNumber
      }
    },
    created_at: date,
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
) =>
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
  messageId?: string,
  dueDate?: Date,
  amount?: number
): IOResponse<CreatedMessageWithContent> => {
  return {
    payload: validatePayload(
      CreatedMessageWithContent,
      createMessageWithContent(
        fiscalCode,
        serviceId,
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
  fiscalCode: string,
  randomId: boolean = false
): IOResponse<PaginatedCreatedMessageWithoutContentCollection> => {
  return {
    payload: createMessageList(count, randomId, fiscalCode),
    isJson: true
  };
};

// 404 - message NOT found
export const messagesResponseNotFound: IOResponse<string> = {
  payload: "not found",
  isJson: false,
  status: 404
};
