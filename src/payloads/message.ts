import * as path from "path";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { faker } from "@faker-js/faker/locale/it";
import { slice } from "lodash";
import { CreatedMessageWithContent } from "../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { EUCovidCert } from "../../generated/definitions/backend/EUCovidCert";
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
import { contentTypeMapping, listDir } from "../utils/file";
import { getRandomIntInRange } from "../utils/id";
import { getRptID } from "../utils/messages";
import { validatePayload } from "../utils/validator";
import { thirdPartyMessagePreconditionMarkdown } from "../utils/variables";
import { ThirdPartyMessagePrecondition } from "../../generated/definitions/backend/ThirdPartyMessagePrecondition";
import { currentProfile } from "./profile";
import ServicesDB from "./../persistence/services";
import { pnServiceId } from "./services/special/pn/factoryPn";

// eslint-disable-next-line functional/no-let
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
): CreatedMessageWithContent => ({
  ...message,
  content: { ...message.content, due_date: dueDate }
});

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
): ThirdPartyMessageWithContent => ({
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
});

export const withPaymentData = (
  message: CreatedMessageWithContent,
  invalidAfterDueDate: boolean = false,
  noticeNumber: string = faker.helpers.replaceSymbolWithNumber(
    "0#################"
  ),
  amount: number = getRandomIntInRange(1, 10000)
): CreatedMessageWithContent => {
  const serviceId = message.sender_service_id;
  const service = ServicesDB.getService(serviceId);
  if (!service) {
    throw Error(
      `message.withPaymentData: unabled to find service with id (${serviceId})`
    );
  }
  const data: PaymentDataWithRequiredPayee = {
    notice_number: noticeNumber as PaymentNoticeNumber,
    amount: amount as PaymentAmount,
    invalid_after_due_date: invalidAfterDueDate,
    payee: {
      fiscal_code: service.organization_fiscal_code
    }
  };
  const paymentData = validatePayload(PaymentDataWithRequiredPayee, data);
  return {
    ...message,
    content: { ...message.content, payment_data: paymentData }
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
  const serviceId = message.sender_service_id;
  const senderService = ServicesDB.getService(serviceId);
  if (!senderService) {
    throw Error(
      `message.getCategory: unabled to find service with id (${serviceId})`
    );
  }
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
  const slicedRemoteAttachmentFiles = slice(
    remoteAttachmentFiles,
    0,
    safeAttachmentCount
  );
  return thirdPartyAttachmentFromAbsolutePathArray(slicedRemoteAttachmentFiles);
};

export const getThirdPartyMessagePrecondition =
  (): ThirdPartyMessagePrecondition =>
    validatePayload(ThirdPartyMessagePrecondition, {
      title: "Questo messaggio contiene una comunicazione a valore legale",
      markdown: thirdPartyMessagePreconditionMarkdown
    });
