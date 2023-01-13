import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as faker from "faker";
import _ from "lodash";
import * as path from "path";
import sha256 from "sha256";
import { Attachment } from "../../generated/definitions/backend/Attachment";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { EUCovidCert } from "../../generated/definitions/backend/EUCovidCert";
import { LegalMessage } from "../../generated/definitions/backend/LegalMessage";
import { LegalMessageWithContent } from "../../generated/definitions/backend/LegalMessageWithContent";
import { MessageCategory } from "../../generated/definitions/backend/MessageCategory";
import { TagEnum as TagEnumBase } from "../../generated/definitions/backend/MessageCategoryBase";
import { TagEnum as TagEnumPayment } from "../../generated/definitions/backend/MessageCategoryPayment";
import {
  MessageCategoryPN,
  TagEnum as TagEnumPN
} from "../../generated/definitions/backend/MessageCategoryPN";
import { NewMessageContent } from "../../generated/definitions/backend/NewMessageContent";
import { PaymentAmount } from "../../generated/definitions/backend/PaymentAmount";
import { PaymentDataWithRequiredPayee } from "../../generated/definitions/backend/PaymentDataWithRequiredPayee";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { PrescriptionData } from "../../generated/definitions/backend/PrescriptionData";
import { ThirdPartyAttachment } from "../../generated/definitions/backend/ThirdPartyAttachment";
import { ThirdPartyMessageWithContent } from "../../generated/definitions/backend/ThirdPartyMessageWithContent";
import { assetsFolder } from "../config";
import { services } from "../routers/service";
import { contentTypeMapping, listDir } from "../utils/file";
import { getRandomIntInRange } from "../utils/id";
import { getRptID } from "../utils/messages";
import { getRandomValue } from "../utils/random";
import { serverUrl } from "../utils/server";
import { addApiV1Prefix } from "../utils/strings";
import { validatePayload } from "../utils/validator";
import { currentProfile } from "./profile";
import { pnServiceId } from "./services/special";

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

/**
 * Add the MVL payload to a generic message.
 */
export const withLegalContent = (
  message: CreatedMessageWithContent,
  mvlMsgId: string,
  attachments: ReadonlyArray<Attachment> = [],
  hasHtml: boolean = true
): LegalMessageWithContent => {
  // helper functions
  const getEmail = (hardCodedEmail: string) =>
    getRandomValue(hardCodedEmail, faker.internet.email(), "messages");
  const getWords = (hardCodedWords: string) =>
    getRandomValue(hardCodedWords, faker.random.words(), "messages");
  const getWord = (hardCodedWord: string) =>
    getRandomValue(hardCodedWord, faker.random.word(), "messages");
  const sender = getEmail("dear.leader@yourworld.hell") as NonEmptyString;
  const legalMessage: LegalMessage = {
    eml: {
      subject: getWords("You're fired"),
      plain_text_content: getWords("lol I'm joking!"),
      html_content: hasHtml ? getWords("<p>or <b>am I?</b></p>") : "",
      attachments
    },
    cert_data: {
      header: {
        sender,
        recipients: getEmail("slave@yourworld.hell") as NonEmptyString,
        replies: getEmail("down.the.john@theshitIgive.hell") as NonEmptyString,
        object: getWords("I told you already: you're fired") as NonEmptyString
      },
      data: {
        sender_provider: getWord("apocalypse knights") as NonEmptyString,
        timestamp: getRandomValue(new Date(), faker.date.past(), "messages"),
        envelope_id: getWord("abcde") as NonEmptyString,
        msg_id: mvlMsgId as NonEmptyString,
        receipt_type: getWord("what's that?")
      }
    }
  };
  return {
    ...message,
    content: {
      ...message.content,
      legal_data: {
        sender_mail_from: sender,
        has_attachment: attachments.length > 0,
        message_unique_id: mvlMsgId as NonEmptyString
      }
    },
    legal_message: legalMessage
  };
};

export const withPNContent = (
  message: CreatedMessageWithContent,
  iun: string,
  senderDenomination: string | undefined,
  subject: string,
  abstract: string | undefined,
  sentAt: Date
): ThirdPartyMessageWithContent => {
  const paymentData = withPaymentData(message).content.payment_data;
  const recipients = paymentData
    ? {
        recipients: [
          {
            recipientType: "PF",
            taxId: `${currentProfile.fiscal_code}`,
            denomination: `${currentProfile.name} ${currentProfile.family_name}`,
            payment: {
              noticeCode: paymentData.notice_number,
              creditorTaxId: paymentData.payee.fiscal_code
            }
          }
        ]
      }
    : {};

  const notificationStatusHistory: ReadonlyArray<{
    status: string;
    activeFrom: string;
    relatedTimelineElements: ReadonlyArray<string>;
  }> = [
    {
      status: "ACCEPTED",
      activeFrom: "2022-07-07T13:26:59.494+00:00",
      relatedTimelineElements: [
        "TPAK-PJUT-RALE-202207-X-1_request_accepted",
        "TPAK-PJUT-RALE-202207-X-1_aar_gen_0",
        "TPAK-PJUT-RALE-202207-X-1_send_courtesy_message_0_index_0",
        "TPAK-PJUT-RALE-202207-X-1_get_address0_source_DigitalAddressSourceInt.PLATFORM(value=PLATFORM)_attempt_0"
      ]
    },
    {
      status: "DELIVERING",
      activeFrom: "2022-07-07T13:27:15.913+00:00",
      relatedTimelineElements: [
        "TPAK-PJUT-RALE-202207-X-1_send_digital_domicile0_source_DigitalAddressSourceInt.SPECIAL(value=SPECIAL)_attempt_1",
        "TPAK-PJUT-RALE-202207-X-1_get_address0_source_DigitalAddressSourceInt.SPECIAL(value=SPECIAL)_attempt_0"
      ]
    },
    {
      status: "VIEWED",
      activeFrom: "2022-07-07T14:26:22.669+00:00",
      relatedTimelineElements: [
        "TPAK-PJUT-RALE-202207-X-1_notification_viewed_0"
      ]
    }
  ];

  return {
    ...message,
    third_party_message: {
      attachments: getPnAttachments(),
      details: {
        iun,
        senderDenomination,
        subject,
        abstract,
        sentAt,
        notificationStatusHistory,
        ...recipients
      }
    }
  };
};

export const withRemoteAttachments = (
  message: CreatedMessageWithContent,
  attachmentCount: number
): ThirdPartyMessageWithContent => {
  return {
    ...message,
    content: {
      ...message.content,
      third_party_data: {
        ...message.content.third_party_data,
        id: message.id as NonEmptyString,
        has_attachments: true
      }
    },
    third_party_message: {
      attachments: getRemoteAttachments(attachmentCount)
    }
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
  if (
    ThirdPartyMessageWithContent.is(message) &&
    senderService.service_id === pnServiceId
  ) {
    return {
      tag: TagEnumPN.PN,
      original_sender: message.third_party_message.details?.senderDenomination,
      id: message.third_party_message.details?.iun,
      original_receipt_date: message.third_party_message.details?.sentAt,
      summary: message.third_party_message.details?.subject
    } as MessageCategoryPN;
  }
  if (LegalMessageWithContent.is(message)) {
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

export const defaultContentType = "application/octet-stream";
// list all files available as mvl attachments
const mvlAttachmentsFiles = listDir(assetsFolder + "/messages/mvl/attachments");
/**
 * create an array of attachments following the given types {@param attachmentsTypes}
 * i.e: getMvlAttachments("aMessageID",["png","zip"]) -> return 2 attachments: png + zip
 * @param mvlMessageId
 * @param attachmentsTypes
 */
export const getMvlAttachments = (
  mvlMessageId: string,
  attachmentsTypes: ReadonlyArray<keyof typeof contentTypeMapping>
): ReadonlyArray<Attachment> => {
  return attachmentsTypes.map((type, idx) => {
    {
      const filename =
        mvlAttachmentsFiles.find(f => f.endsWith(type)) ??
        mvlAttachmentsFiles[0];
      const parsedFile = path.parse(filename);
      const attachmentId = sha256(parsedFile.name);
      const resource = addApiV1Prefix(
        `/legal-messages/${mvlMessageId}/attachments/${attachmentId}`
      );
      const attachmentUrl = `${serverUrl}${resource}`;
      return {
        id: attachmentId,
        name: parsedFile.base,
        content_type:
          contentTypeMapping[parsedFile.ext.substr(1)] ?? defaultContentType,
        url: attachmentUrl,
        size: idx > 0 ? idx * 100000 : undefined
      };
    }
  });
};

function thirdPartyAttachmentFromAbsolutePathArray(
  absolutePaths: ReadonlyArray<string>
) {
  return absolutePaths
    .filter(f => f.endsWith("pdf"))
    .map((filename, index) => {
      const parsedFile = path.parse(filename);
      const attachmentId = `${index}`;
      const attachmentUrl = attachmentId;
      return {
        id: attachmentId,
        name: parsedFile.base,
        content_type:
          contentTypeMapping[parsedFile.ext.substr(1)] ?? defaultContentType,
        url: attachmentUrl
      } as ThirdPartyAttachment;
    });
}

const pnAttachmentsFiles = listDir(assetsFolder + "/messages/pn/attachments");

export const getPnAttachments = (): ReadonlyArray<ThirdPartyAttachment> =>
  thirdPartyAttachmentFromAbsolutePathArray(pnAttachmentsFiles);

const remoteAttachmentFiles = listDir(
  assetsFolder + "/messages/remote/attachments"
);
export const remoteAttachmentFileCount = remoteAttachmentFiles.length;

export const getRemoteAttachments = (
  attachmentCount: number
): ReadonlyArray<ThirdPartyAttachment> => {
  const safeAttachmentCount = Math.min(
    attachmentCount,
    remoteAttachmentFileCount
  );
  const slicedRemoteAttachmentFiles = _.slice(
    remoteAttachmentFiles,
    0,
    safeAttachmentCount
  );
  return thirdPartyAttachmentFromAbsolutePathArray(slicedRemoteAttachmentFiles);
};
