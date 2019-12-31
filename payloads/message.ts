import { range } from "fp-ts/lib/Array";
import { CreatedMessageWithContent } from "../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../generated/definitions/backend/CreatedMessageWithoutContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

/**
 * generate a 26 chars pseudo-random string
 */
const getRandomId = (): string => {
  const randomSlice = () =>
    Math.random()
      .toString(36)
      .substring(2, 15);
  return (randomSlice() + randomSlice() + randomSlice())
    .substring(0, 26)
    .toUpperCase();
};

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
        ? getRandomId()
        : messageId
        ? messageId
        : `${idx}`.padStart(26, "0");
    date.setSeconds(idx);
    return {
      created_at: date.toISOString(),
      fiscal_code: fiscalCode,
      id: msgId,
      sender_service_id: `dev-service_${idx}`,
      time_to_live: 3600
    };
  });
};

export const createMessageWithContent = (
  count: number,
  fiscalCode: string,
  serviceId: string,
  randomId: boolean = false,
  messageId?: string
) => {
  return range(1, count).map(idx => {
    const date = new Date();
    const msgId =
      randomId === true
        ? getRandomId()
        : messageId
        ? messageId
        : `${idx}`.padStart(26, "0");
    date.setSeconds(idx);
    return {
      content: {
        subject: `subject [${serviceId}]`,
        markdown:
          "😊 this is a mock message this is a mock message this is a mock message this is a mock message",
        due_date: date
      },
      created_at: date,
      fiscal_code: fiscalCode,
      id: msgId,
      sender_service_id: serviceId,
      time_to_live: 3600
    };
  });
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
  messageId: string,
  serviceId: string,
  fiscalCode: string
): IOResponse<CreatedMessageWithContent> => {
  return {
    payload: validatePayload(
      CreatedMessageWithContent,
      createMessageWithContent(1, fiscalCode, serviceId, false, messageId)[0]
    )
  };
};

/**
 * return a list containing count messages
 * @param count the number of message to generate
 * @param randomId if true a random id is generated, a fixed one otherwise
 */
export const messagesResponseOkList = (
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
