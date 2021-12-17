import { UTCISODateFromString } from "@pagopa/ts-commons/lib/dates";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as faker from "faker";
import { Attachment } from "../../generated/definitions/backend/Attachment";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { EUCovidCert } from "../../generated/definitions/backend/EUCovidCert";
import { LegalMessage } from "../../generated/definitions/backend/LegalMessage";
import { LegalMessageWithContent } from "../../generated/definitions/backend/LegalMessageWithContent";
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
import { getRptID } from "../utils/messages";
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

export const withLegalContent = (
  message: CreatedMessageWithContent,
  attachments: ReadonlyArray<Attachment> = []
): LegalMessageWithContent => {
  const legalMessage: LegalMessage = {
    eml: {
      subject: "You're fired",
      plain_text_content: "lol I'm joking!",
      html_content: "<p>or <b>am I?</b></p>",
      attachments
    },
    cert_data: {
      header: {
        sender: "dear.leader@yourworld.hell" as NonEmptyString,
        recipients: "slave@yourworld.hell" as NonEmptyString,
        replies: "down.the.john@theshitIgive.hell" as NonEmptyString,
        object: "I told you already: you're fired" as NonEmptyString
      },
      data: {
        sender_provider: "apocalypse knights" as NonEmptyString,
        timestamp: (new Date().toISOString() as unknown) as UTCISODateFromString,
        envelope_id: "abcde" as NonEmptyString,
        msg_id: "fghi" as NonEmptyString,
        receipt_type: "what's that?"
      }
    }
  };
  return {
    ...message,
    legal_message: legalMessage
  };
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
  if ((message as LegalMessageWithContent).legal_message) {
    return {
      tag: TagEnumBase.LEGAL_MESSAGE
    };
  }
  if (eu_covid_cert?.auth_code) {
    return {
      tag: TagEnumBase.EU_COVID_CERT
    };
  }
  if (payment_data) {
    return {
      tag: TagEnumPayment.PAYMENT,
      rptId: getRptID(senderService, payment_data)
    };
  }
  return {
    tag: TagEnumBase.GENERIC
  };
};
