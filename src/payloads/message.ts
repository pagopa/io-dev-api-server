import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as faker from "faker";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { EUCovidCert } from "../../generated/definitions/backend/EUCovidCert";
import { MessageCategory } from "../../generated/definitions/backend/MessageCategory";
import { TagEnum as TagEnumBase } from "../../generated/definitions/backend/MessageCategoryBase";
import { TagEnum as TagEnumPayment } from "../../generated/definitions/backend/MessageCategoryPayment";
import { NewMessageContent } from "../../generated/definitions/backend/NewMessageContent";
import { PaymentAmount } from "../../generated/definitions/backend/PaymentAmount";
import { PaymentDataWithRequiredPayee } from "../../generated/definitions/backend/PaymentDataWithRequiredPayee";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { services } from "../routers/service";
import { getRandomIntInRange } from "../utils/id";
import { validatePayload } from "../utils/validator";

// tslint:disable-next-line: no-let
let messageIdIndex = 0;

/**
 * Generate basic message data based on fiscal code, sender ID, and time to live
 * @param fiscalCode
 * @param senderServiceId
 * @param timeToLive
 */
export const createMessage = (
  fiscalCode: FiscalCode,
  senderServiceId: string,
  timeToLive: number = 3600
): CreatedMessageWithoutContent => {
  const id = messageIdIndex.toString().padStart(26, "0");
  messageIdIndex++;
  return validatePayload(CreatedMessageWithoutContent, {
    created_at: new Date(new Date().getTime() + messageIdIndex * 1000),
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
  const data: PaymentDataWithRequiredPayee = {
    notice_number: noticeNumber as PaymentNoticeNumber,
    amount: amount as PaymentAmount,
    invalid_after_due_date: invalidAfterDueDate,
    payee: {
      fiscal_code: services.find(
        s => s.service_id === message.sender_service_id
      )?.organization_fiscal_code!
    }
  };
  const paymementData = validatePayload(PaymentDataWithRequiredPayee, data);
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
  euCovidCert?: EUCovidCert
): CreatedMessageWithContent => {
  const content = validatePayload(NewMessageContent, {
    subject,
    markdown,
    prescription_data: prescriptionData,
    eu_covid_cert: euCovidCert
  });
  return { ...message, content };
};

export const getCategory = (
  message: CreatedMessageWithContent
): MessageCategory => {
  const { eu_covid_cert, payment_data } = message.content;
  const senderService = services.find(
    s => s.service_id === message.sender_service_id
  )!;
  if (eu_covid_cert?.auth_code) {
    return {
      tag: TagEnumBase.EU_COVID_CERT
    };
  }
  if (payment_data) {
    return {
      tag: TagEnumPayment.PAYMENT,
      rptId: `${senderService.organization_fiscal_code}${payment_data.notice_number}`
    };
  }
  return {
    tag: TagEnumBase.GENERIC
  };
};
