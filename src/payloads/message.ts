import * as faker from "faker";
import { index, range } from "fp-ts/lib/Array";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { MessageContent } from "../../generated/definitions/backend/MessageContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { PaymentAmount } from "../../generated/definitions/backend/PaymentAmount";
import { PaymentData } from "../../generated/definitions/backend/PaymentData";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { getRandomIntInRange } from "../../src/utils/id";
import { validatePayload } from "../../src/utils/validator";
import { IOResponse } from "./response";

export const base64png =
  "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";
export const base64svg =
  "PHN2ZyB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0MjIiIGhlaWdodD0iMTQ1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIgZD0iTTIgMTQ0TDIgME0zMiAxNDRMMzIgME00NiAxNDRMNDYgME03NiAxNDRMNzYgME05OCAxNDRMOTggME0xMTIgMTQ0TDExMiAwTTE1MCAxNDRMMTUwIDBNMTY0IDE0NEwxNjQgME0xNzggMTQ0TDE3OCAwTTIwOCAxNDRMMjA4IDBNMjM2IDE0NEwyMzYgME0yNDQgMTQ0TDI0NCAwTTI3OCAxNDRMMjc4IDBNMzA0IDE0NEwzMDQgME0zMTAgMTQ0TDMxMCAwTTM0MCAxNDRMMzQwIDBNMzU0IDE0NEwzNTQgME0zNzYgMTQ0TDM3NiAwTTM4MiAxNDRMMzgyIDBNMzg4IDE0NEwzODggME0zOTggMTQ0TDM5OCAwTTQyMCAxNDRMNDIwIDAiIC8+CjxwYXRoIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNNyAxNDRMNyAwTTEzIDE0NEwxMyAwTTIzIDE0NEwyMyAwTTQxIDE0NEw0MSAwTTU1IDE0NEw1NSAwTTY3IDE0NEw2NyAwTTg5IDE0NEw4OSAwTTEwNyAxNDRMMTA3IDBNMTIxIDE0NEwxMjEgME0xMzMgMTQ0TDEzMyAwTTE0MSAxNDRMMTQxIDBNMTg1IDE0NEwxODUgME0xOTkgMTQ0TDE5OSAwTTIxMyAxNDRMMjEzIDBNMjIxIDE0NEwyMjEgME0yNTEgMTQ0TDI1MSAwTTI2NSAxNDRMMjY1IDBNMjczIDE0NEwyNzMgME0yODcgMTQ0TDI4NyAwTTMyNSAxNDRMMzI1IDBNMzYzIDE0NEwzNjMgME0zNzEgMTQ0TDM3MSAwTTQxNSAxNDRMNDE1IDAiIC8+CjxwYXRoIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI2IiBkPSJNNjEgMTQ0TDYxIDBNODMgMTQ0TDgzIDBNMTI3IDE0NEwxMjcgME0xNTcgMTQ0TDE1NyAwTTE3MSAxNDRMMTcxIDBNMTkzIDE0NEwxOTMgME0yMjkgMTQ0TDIyOSAwTTI1OSAxNDRMMjU5IDBNMjk1IDE0NEwyOTUgME0zMTcgMTQ0TDMxNyAwTTMzMyAxNDRMMzMzIDBNMzQ3IDE0NEwzNDcgME00MDkgMTQ0TDQwOSAwIiAvPgo8L3N2Zz4K";

// tslint:disable-next-line: no-let
let messageIdIndex = 0;
/**
 * generate a list containg count messages with the given fiscal_code
 * @param count the number of messages to generate
 * @param fiscal_code
 */
const createMessageItem = (
  fiscalCode: string,
  senderServiceId: string,
  timeToLive: number = 3600
): CreatedMessageWithoutContent => {
  const id = messageIdIndex.toString().padStart(26, "0");
  messageIdIndex++;
  return validatePayload(CreatedMessageWithoutContent, {
    created_at: new Date("2020-11-19T23:15:56.756Z").toISOString(),
    fiscal_code: fiscalCode,
    id,
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
  invalidAfterDueDate: boolean = false,
  noticeNumber: string = faker.helpers.replaceSymbolWithNumber(
    "0#################"
  ),
  amount: number = getRandomIntInRange(1, 10000)
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
  markdown: string,
  prescriptionData?: PrescriptionData
): CreatedMessageWithContent => {
  const content = validatePayload(MessageContent, {
    subject,
    markdown,
    prescription_data: prescriptionData
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
