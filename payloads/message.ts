import { range } from "fp-ts/lib/Array";
import { CreatedMessageWithoutContent } from "../generated/definitions/backend/CreatedMessageWithoutContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

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

const messages = {
  items: [
    {
      created_at: "2019-10-03T16:22:50.200Z",
      id: "01DP96WR2EKVRQR2JKXJDT8CV1",
      sender_service_id: "azure-deployc49a",
      time_to_live: 3600
    },
    {
      created_at: "2019-10-03T16:22:50.200Z",
      id: "01DP96WR2EKVRQR2JKXJDT8CV4",
      sender_service_id: "azure-deployc49a",
      time_to_live: 3600
    },
    {
      created_at: "2019-10-03T16:22:50.200Z",
      id: "01DP96WR2EKVRQR2JKXJDT8CV2",
      sender_service_id: "azure-deployc49a",
      time_to_live: 3600
    },
    {
      created_at: "2019-10-03T16:22:50.200Z",
      id: "01DP96WR2EKVRQR2JKXJDT8CV3",
      sender_service_id: "azure-deployc49a",
      time_to_live: 3600
    }
  ],
  page_size: 12
};

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
 * return a list with custom messages (defined above)
 */
export const messagesResponseOk = (fiscalCode: string) => {
  return {
    payload: validatePayload(PaginatedCreatedMessageWithoutContentCollection, {
      ...messages,
      items: messages.items.map(item => {
        return { ...item, fiscal_code: fiscalCode };
      })
    }),
    isJson: true
  };
};

export const getMessage = (
  messageId: string,
  fiscalCode: string
): IOResponse => {
  return {
    payload: validatePayload(
      CreatedMessageWithoutContent,
      createMessage(1, fiscalCode, false, messageId)[0]
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
): IOResponse => {
  return {
    payload: createMessageList(count, randomId, fiscalCode),
    isJson: true
  };
};

// 404 not found
export const messagesResponseNotFound: IOResponse = {
  payload: "not found",
  isJson: false,
  status: 404
};
