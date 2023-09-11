import * as path from "path";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { faker } from "@faker-js/faker/locale/it";
import { slice } from "lodash";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
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
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { FiscalCode } from "../../generated/definitions/backend/FiscalCode";
import { OrganizationFiscalCode } from "../../generated/definitions/backend/OrganizationFiscalCode";
import { pnServiceId } from "../features/pn/services/services";
import ServicesDB from "./../persistence/services";

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

export const generatePaymentData = (
  organizationFiscalCode: OrganizationFiscalCode,
  invalidAfterDueDate: boolean = false,
  noticeNumber: string = `0${faker.random.numeric(17)}`,
  amount: number = getRandomIntInRange(1, 10000)
) =>
  pipe(
    {
      notice_number: noticeNumber as PaymentNoticeNumber,
      amount: amount as PaymentAmount,
      invalid_after_due_date: invalidAfterDueDate,
      payee: {
        fiscal_code: organizationFiscalCode
      }
    },
    (data: PaymentDataWithRequiredPayee) =>
      validatePayload(PaymentDataWithRequiredPayee, data)
  );

const serviceFromMessage = (
  message: CreatedMessageWithContent
): E.Either<Error, Readonly<ServicePublic>> =>
  pipe(message.sender_service_id, serviceId =>
    pipe(
      serviceId,
      ServicesDB.getService,
      E.fromNullable(
        Error(
          `serviceFromMessage: unabled to find service with id (${serviceId})`
        )
      )
    )
  );

export const withPaymentData = (
  message: CreatedMessageWithContent,
  invalidAfterDueDate: boolean = false,
  noticeNumber: string = `0${faker.random.numeric(17)}`,
  amount: number = getRandomIntInRange(1, 10000)
): E.Either<Error, CreatedMessageWithContent> =>
  pipe(
    message,
    serviceFromMessage,
    E.map(service =>
      pipe(
        generatePaymentData(
          service.organization_fiscal_code,
          invalidAfterDueDate,
          noticeNumber,
          amount
        ),
        payment_data => ({
          ...message,
          content: { ...message.content, payment_data }
        })
      )
    )
  );

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

export function thirdPartyAttachmentFromAbsolutePathArray(
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
