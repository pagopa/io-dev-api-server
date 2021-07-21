import * as faker from "faker";
import { index, range } from "fp-ts/lib/Array";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import {
  MessageContent,
  MessageContentEu_covid_cert
} from "../../generated/definitions/backend/MessageContent";
import { PaginatedCreatedMessageWithoutContentCollection } from "../../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { PaymentAmount } from "../../generated/definitions/backend/PaymentAmount";
import { PaymentData } from "../../generated/definitions/backend/PaymentData";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { getRandomIntInRange } from "../utils/id";
import { validatePayload } from "../utils/validator";

// tslint:disable-next-line: no-let
let messageIdIndex = 0;
/**
 * generate a list containg count messages with the given fiscal_code
 * @param fiscalCode
 * @param senderServiceId
 * @param timeToLive
 */
export const createMessage = (
  fiscalCode: string,
  senderServiceId: string,
  timeToLive: number = 3600
): CreatedMessageWithoutContent => {
  const id = messageIdIndex.toString().padStart(26, "0");
  messageIdIndex++;
  return validatePayload(CreatedMessageWithoutContent, {
    created_at: new Date().toISOString(),
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

export const withContent = (
  message: CreatedMessageWithoutContent,
  subject: string,
  markdown: string,
  prescriptionData?: PrescriptionData,
  euCovidCert?: MessageContentEu_covid_cert
): CreatedMessageWithContent => {
  const content = validatePayload(MessageContent, {
    subject,
    markdown,
    prescription_data: prescriptionData,
    eu_covid_cert: euCovidCert
  });
  return { ...message, content };
};

/**
 * return a list of count messages without content
 * @param count the number of messages
 * @param fiscalCode the receiver fiscal code
 * @param services
 */
const createMessageList = (
  count: number,
  fiscalCode: string,
  services: ReadonlyArray<ServicePublic>
): PaginatedCreatedMessageWithoutContentCollection => {
  const items = range(1, count).map(c => {
    return createMessage(
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
