import * as path from "path";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import {
  FiscalCode,
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
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
import { PNMessageTemplate } from "../types/config";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import PaymentDB from "../persistence/payments";
import { rptId } from "../utils/payment";
import { OrganizationName } from "../../generated/definitions/backend/OrganizationName";
import { Detail_v2Enum } from "../../generated/definitions/backend/PaymentProblemJson";
import { eitherMakeBy } from "../utils/array";
import { PaymentStatus } from "../types/PaymentStatus";
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

const generateRecipientsAndAccumulate = (
  accumulator: NotificationRecipient[],
  count: number,
  paymentDataGenerator: () => E.Either<string[], PaymentDataWithRequiredPayee>,
  maybePaymentStatusGenerator: O.Option<
    (input: PaymentDataWithRequiredPayee) => PaymentStatus
  >,
  fiscalCode: FiscalCode = currentProfile.fiscal_code
) =>
  pipe(
    eitherMakeBy(count, _ =>
      generateNotificationRecipient(
        pipe(
          paymentDataGenerator(),
          E.map(paymentDataWithRequiredPayee =>
            pipe(
              maybePaymentStatusGenerator,
              O.map(paymentStatusGenerator =>
                paymentStatusGenerator(paymentDataWithRequiredPayee)
              ),
              _ => paymentDataWithRequiredPayee
            )
          )
        ),
        fiscalCode
      )
    ),
    accumulate(accumulator)
  );

const accumulate =
  <E, A>(accumulator: A[]) =>
  (input: E.Either<E, A[]>): E.Either<E, A[]> =>
    E.map((notificationRecipients: A[]) => [
      ...accumulator,
      ...notificationRecipients
    ])(input);

const generatePNRecipients = (
  organizationFiscalCode: OrganizationFiscalCode,
  organizationName: OrganizationName,
  template: PNMessageTemplate
): E.Either<string[], NotificationRecipient[]> =>
  pipe(
    E.right([] as NotificationRecipient[]),
    E.chain(accumulator =>
      generateRecipientsAndAccumulate(
        accumulator,
        template.unrelatedPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode),
        O.none,
        "VLRCMD74S01B655P" as FiscalCode
      )
    ),
    E.chain(accumulator =>
      generateRecipientsAndAccumulate(
        accumulator,
        template.unpaidValidPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode),
        O.some(paymentDataWithRequiredPayee =>
          PaymentDB.createProcessablePayment(
            rptId(paymentDataWithRequiredPayee),
            paymentDataWithRequiredPayee.amount,
            paymentDataWithRequiredPayee.payee.fiscal_code,
            organizationName
          )
        )
      )
    ),
    E.chain(accumulator =>
      generateRecipientsAndAccumulate(
        accumulator,
        template.unpaidExpiredPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode, true),
        O.some(paymentDataWithRequiredPayee =>
          PaymentDB.createProcessedPayment(
            rptId(paymentDataWithRequiredPayee),
            Detail_v2Enum.PAA_PAGAMENTO_SCADUTO
          )
        )
      )
    ),
    E.chain(accumulator =>
      generateRecipientsAndAccumulate(
        accumulator,
        template.failedPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode),
        O.some(paymentDataWithRequiredPayee =>
          PaymentDB.createProcessedPayment(
            rptId(paymentDataWithRequiredPayee),
            Detail_v2Enum.PPT_IBAN_NON_CENSITO
          )
        )
      )
    ),
    E.chain(accumulator =>
      generateRecipientsAndAccumulate(
        accumulator,
        template.paidPayments,
        () => PaymentDB.createPaymentData(organizationFiscalCode),
        O.some(paymentDataWithRequiredPayee =>
          PaymentDB.createProcessedPayment(
            rptId(paymentDataWithRequiredPayee),
            Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
          )
        )
      )
    )
  );

export type NotificationPaymentInfo = {
  noticeCode: PaymentNoticeNumber;
  creditorTaxId: OrganizationFiscalCode;
};

export type NotificationRecipient = {
  taxId: string;
  denomination: string;
  payment: NotificationPaymentInfo;
};

const generateNotificationRecipient = (
  paymentDataWithRequiredPayee: E.Either<
    string[],
    PaymentDataWithRequiredPayee
  >,
  fiscalCode: FiscalCode
): E.Either<string[], NotificationRecipient> =>
  pipe(
    paymentDataWithRequiredPayee,
    E.map(paymentDataWithRequiredPayee => ({
      taxId: fiscalCode,
      denomination: `${currentProfile.name} ${currentProfile.family_name}`,
      payment: {
        noticeCode: paymentDataWithRequiredPayee.notice_number,
        creditorTaxId: paymentDataWithRequiredPayee.payee.fiscal_code
      }
    }))
  );

const generatePNTimeline = () => [
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
    relatedTimelineElements: ["TPAK-PJUT-RALE-202207-X-1_notification_viewed_0"]
  }
];

export const withPNContent = (
  template: PNMessageTemplate,
  message: CreatedMessageWithContent,
  organization_fiscal_code: OrganizationFiscalCode,
  organizationName: OrganizationName,
  iun: string,
  senderDenomination: string | undefined,
  subject: string,
  abstract: string | undefined,
  sentAt: Date
): E.Either<string[], ThirdPartyMessageWithContent> =>
  pipe(
    generatePNRecipients(organization_fiscal_code, organizationName, template),
    E.map(pnRecipients => ({
      ...message,
      third_party_message: {
        attachments: getPnAttachments(),
        details: {
          iun,
          senderDenomination,
          subject,
          abstract,
          sentAt,
          notificationStatusHistory: generatePNTimeline(),
          recipients: pnRecipients
        }
      }
    }))
  );

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
