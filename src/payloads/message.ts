import { index, range } from "fp-ts/lib/Array";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { MessageContent } from "../../generated/definitions/backend/MessageContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { PaymentAmount } from "../../generated/definitions/backend/PaymentAmount";
import { PaymentData } from "../../generated/definitions/backend/PaymentData";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { getRandomIntInRange } from "../../src/utils/id";
import { validatePayload } from "../../src/utils/validator";
import { uuidv4 } from "../utils/strings";
import { IOResponse } from "./response";
import * as faker from "faker";

/**
 * generate a list containg count messages with the given fiscal_code
 * @param count the number of messages to generate
 * @param fiscal_code
 */
const createMessageItem = (
  fiscalCode: string,
  senderServiceId: string,
  messageId: string = uuidv4()
    .toUpperCase()
    .substr(0, 26),
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

export const withDueDate = (
  message: CreatedMessageWithContent,
  dueDate: Date
): CreatedMessageWithContent => {
  return { ...message, content: { ...message.content, due_date: dueDate } };
};

export const withPaymentData = (
  message: CreatedMessageWithContent,
  noticeNumber: string = faker.helpers.replaceSymbolWithNumber(
    "0#################"
  ),
  amount: number = getRandomIntInRange(1, 10000),
  invalidAfterDueDate: boolean = false
): CreatedMessageWithContent => {
  const data: PaymentData = {
    notice_number: noticeNumber as PaymentNoticeNumber,
    amount: amount as PaymentAmount,
    invalid_after_due_date: invalidAfterDueDate
  };
  const paymementData = validatePayload(PaymentData, data);
  return {
    ...message,
    content: { ...message.content, payment_data: paymementData }
  };
};

export const withMessageContent = (
  message: CreatedMessageWithoutContent,
  subject: string,
  markdown: string
): CreatedMessageWithContent => {
  const content = validatePayload(MessageContent, {
    subject,
    markdown
  });
  return { ...message, content };
};

/**
 * return a list of count messages without content
 * @param count the number of messages
 * @param randomId if true a random if will be generated
 * @param fiscalCode the receiver fiscal code
 */
const createMessageList = (
  count: number,
  fiscalCode: string,
  services: ReadonlyArray<ServicePublic>
): PaginatedCreatedMessageWithoutContentCollection => {
  const items = range(1, count).map(c => {
    return createMessageItem(
      fiscalCode,
      index((c - 1) % services.length, [...services]).fold(
        "n/a",
        s => s.service_id as string
      )
    );
  });
  return validatePayload(PaginatedCreatedMessageWithoutContentCollection, {
    items,
    page_size: count
  });
};

/**
 * return a list containing count messages
 * @param count the number of message to generate
 * @param randomId if true a random id is generated, a fixed one otherwise
 */
export const getMessages = (
  count: number,
  services: ReadonlyArray<ServicePublic>,
  fiscalCode: string
): IOResponse<PaginatedCreatedMessageWithoutContentCollection> => {
  const payload = createMessageList(count, fiscalCode, services);
  return {
    payload,
    isJson: true
  };
};

// 404 - message NOT found
export const messagesResponseNotFound: IOResponse<string> = {
  payload: "not found",
  isJson: false,
  status: 404
};
