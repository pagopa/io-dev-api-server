import { index, range } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { getRandomIntInRange, getRandomStringId } from "../../src/utils/id";
import { validatePayload } from "../../src/utils/validator";
import { uuidv4 } from "../utils/strings";
import { messageMarkdown } from "../utils/variables";
import { IOResponse } from "./response";

/**
 * generate a list containg count messages with the given fiscal_code
 * @param count the number of messages to generate
 * @param fiscal_code
 */
const createMessageItem = (
  fiscalCode: string,
  senderServiceId: string,
  messageId: string = uuidv4(),
  timeToLive: number = 3600
): CreatedMessageWithoutContent => {
  return validatePayload(CreatedMessageWithoutContent, {
    created_at: new Date().toISOString(),
    fiscal_code: fiscalCode,
    id: messageId,
    sender_service_id: senderServiceId,
    time_to_live: timeToLive
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
  fiscalCode: string,
  services: ReadonlyArray<ServicePublic>
): PaginatedCreatedMessageWithoutContentCollection => {
  const items = range(1, count).map(c => {
    return createMessageItem(
      fiscalCode,
      index(c - 1, [...services]).fold("n/a", s => s.service_id as string)
    );
  });
  return validatePayload(PaginatedCreatedMessageWithoutContentCollection, {
    items,
    page_size: count
  });
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
  services: ReadonlyArray<ServicePublic>,
  fiscalCode: string,
  randomId: boolean = false
): IOResponse<PaginatedCreatedMessageWithoutContentCollection> => {
  const list = createMessageList(count, fiscalCode, services);
  return {
    payload: {
      ...list,
      items: list.items.map((m, idx) => {
        const service = services[idx % services.length];
        return {
          ...m,
          sender_service_id: fromNullable(service).fold(
            "n/a",
            s => s.service_id as string
          )
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
