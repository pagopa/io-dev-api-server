import { fiscalCode } from "./profile";
import { range } from "fp-ts/lib/Array";
import { IOResponse } from "./response";
import { validatePayload } from "../utils/validator";
import { PaginatedCreatedMessageWithoutContentCollection } from "../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { MessageResponseWithContent } from "../generated/definitions/backend/MessageResponseWithContent";
import { CreatedMessageWithoutContent } from "../generated/definitions/backend/CreatedMessageWithoutContent";

// 26 chars random string
const getRandomId = (): string =>
  (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  )
    .substring(0, 26)
    .toUpperCase();

/**
 * generate a list containg count messages with the given fiscal_code
 * @param count the number of messages to generate
 * @param fiscal_code
 */
const createMessage = (
  count: number,
  fiscal_code: string,
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
      fiscal_code,
      id: msgId,
      sender_service_id: `dev-service_${idx}`,
      time_to_live: 3600
    };
  });
};

const messages = {
  items: [
    {
      created_at: "2019-10-03T16:22:50.200Z",
      fiscal_code: fiscalCode,
      id: "01DP96WR2EKVRQR2JKXJDT8CV1",
      sender_service_id: "azure-deployc49a",
      time_to_live: 3600
    },
    {
      created_at: "2019-10-03T16:22:50.200Z",
      fiscal_code: fiscalCode,
      id: "01DP96WR2EKVRQR2JKXJDT8CV4",
      sender_service_id: "azure-deployc49a",
      time_to_live: 3600
    },
    {
      created_at: "2019-10-03T16:22:50.200Z",
      fiscal_code: fiscalCode,
      id: "01DP96WR2EKVRQR2JKXJDT8CV2",
      sender_service_id: "azure-deployc49a",
      time_to_live: 3600
    },
    {
      created_at: "2019-10-03T16:22:50.200Z",
      fiscal_code: fiscalCode,
      id: "01DP96WR2EKVRQR2JKXJDT8CV3",
      sender_service_id: "azure-deployc49a",
      time_to_live: 3600
    }
  ],
  page_size: 12
};

export const createMessageList = (count: number, randomId: boolean) =>
  validatePayload(PaginatedCreatedMessageWithoutContentCollection, {
    items: createMessage(count, fiscalCode, randomId),
    page_size: count
  });

const messageCustomList = validatePayload(
  PaginatedCreatedMessageWithoutContentCollection,
  messages
);

/**
 * return a list with custom messages (defined above)
 */
export const messagesResponseOk: IOResponse = {
  payload: messageCustomList,
  isJson: true
};

export const getMessage = (
  messageId: string,
  fiscal_code: string
): IOResponse => {
  return {
    payload: validatePayload(
      CreatedMessageWithoutContent,
      createMessage(1, fiscal_code, false, messageId)[0]
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
  randomId: boolean = false
): IOResponse => {
  return {
    payload: createMessageList(count, randomId),
    isJson: true
  };
};

// 404 not found
export const messagesResponseNotFound: IOResponse = {
  payload: "not found",
  isJson: false,
  status: 404
};
