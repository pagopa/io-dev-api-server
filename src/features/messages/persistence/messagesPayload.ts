import * as path from "path";
import { constUndefined, pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as B from "fp-ts/lib/boolean";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import { faker } from "@faker-js/faker/locale/it";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CreatedMessageWithContent } from "../../../../generated/definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "../../../../generated/definitions/backend/CreatedMessageWithoutContent";
import { NewMessageContent } from "../../../../generated/definitions/backend/NewMessageContent";
import { PaymentAmount } from "../../../../generated/definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../generated/definitions/backend/PaymentNoticeNumber";
import { ThirdPartyAttachment } from "../../../../generated/definitions/backend/ThirdPartyAttachment";
import { ThirdPartyMessageWithContent } from "../../../../generated/definitions/backend/ThirdPartyMessageWithContent";
import { assetsFolder } from "../../../config";
import { contentTypeMapping, listDir } from "../../../utils/file";
import { getRandomIntInRange } from "../../../utils/id";
import { validatePayload } from "../../../utils/validator";
import { thirdPartyMessagePreconditionMarkdown } from "../../../utils/variables";
import { ThirdPartyMessagePrecondition } from "../../../../generated/definitions/backend/ThirdPartyMessagePrecondition";
import { ServiceDetails } from "../../../../generated/definitions/services/ServiceDetails";
import { FiscalCode } from "../../../../generated/definitions/backend/FiscalCode";
import ServicesDB from "../../services/persistence/servicesDatabase";
import PaymentsDB from "../../../persistence/payments";
import { AttachmentCategory } from "../types/attachmentCategory";
import { rptIdFromPaymentDataWithRequiredPayee } from "../../../utils/payment";
import { MessageTemplate } from "../types/messageTemplate";
import { LegacyGreenPass } from "../types/LegacyGreenPass";

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

export const withRemoteContent = (
  template: MessageTemplate,
  message: CreatedMessageWithContent,
  markdown: string
): ThirdPartyMessageWithContent => ({
  ...message,
  content: {
    ...message.content,
    third_party_data: {
      ...message.content.third_party_data,
      id: message.id as NonEmptyString,
      has_attachments: template.attachmentCount > 0,
      has_remote_content: template.hasRemoteContent
    }
  },
  third_party_message: {
    details: pipe(
      template.hasRemoteContent,
      B.fold(constUndefined, () => ({
        subject: faker.lorem.sentence(template.subjectWordCount),
        markdown
      }))
    ),
    attachments: pipe(
      template.attachmentCount > 0,
      B.fold(constUndefined, () =>
        getRemoteAttachments(template.attachmentCount)
      )
    )
  }
});

const serviceFromMessage = (
  message: CreatedMessageWithContent
): E.Either<Error, Readonly<ServiceDetails>> =>
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
    E.chain(service =>
      pipe(
        PaymentsDB.createPaymentData(
          service.organization.fiscal_code,
          invalidAfterDueDate,
          noticeNumber as PaymentNoticeNumber,
          amount as PaymentAmount
        ),
        E.map(paymentDataWithRequiredPayee =>
          pipe(
            PaymentsDB.createProcessablePayment(
              rptIdFromPaymentDataWithRequiredPayee(
                paymentDataWithRequiredPayee
              ),
              amount as PaymentAmount,
              service.organization.fiscal_code,
              service.organization.name
            ),
            _ => ({
              ...message,
              content: {
                ...message.content,
                payment_data: paymentDataWithRequiredPayee
              }
            })
          )
        ),
        E.mapLeft(errors => Error(errors.join("\n")))
      )
    )
  );

export const withContent = (
  message: CreatedMessageWithoutContent,
  subject: string,
  markdown: string,
  legacyGreenPass?: LegacyGreenPass
): CreatedMessageWithContent => {
  const content = validatePayload(NewMessageContent, {
    subject,
    markdown,
    eu_covid_cert: legacyGreenPass
  });
  return { ...message, content };
};

export const defaultContentType = "application/octet-stream";

export const thirdPartyAttachmentFromAbsolutePathArray =
  (
    count: number,
    idOffset: number = 0,
    category: AttachmentCategory = "DOCUMENT"
  ) =>
  (absolutePaths: string[]) =>
    pipe(
      absolutePaths,
      A.filter(absolutePath => absolutePath.endsWith("pdf")),
      pdfAbsolutePaths =>
        A.makeBy(count, attachmentIndex =>
          pipe(
            attachmentIndex % pdfAbsolutePaths.length,
            pdfIndex => pdfAbsolutePaths[pdfIndex],
            pdfAbsolutePath =>
              pipe(
                pdfAbsolutePath,
                path.parse,
                parsedPDFFile =>
                  ({
                    id: `${idOffset + attachmentIndex}`,
                    category,
                    name: parsedPDFFile.name,
                    content_type: contentTypeFromParsedFile(parsedPDFFile),
                    url: attachmentUrlFromAbsolutePath(pdfAbsolutePath)
                  } as ThirdPartyAttachment)
              )
          )
        )
    );

const contentTypeFromParsedFile = (parsedFile: path.ParsedPath) =>
  pipe(
    parsedFile.ext,
    extensionWithDot => extensionWithDot.slice(1),
    extension => contentTypeMapping[extension],
    O.fromNullable,
    O.getOrElse(() => defaultContentType)
  );

const attachmentUrlFromAbsolutePath = (absolutePath: string) =>
  pipe(path.resolve("."), executionDirectoryAbsolutePath =>
    pipe(absolutePath, S.replace(executionDirectoryAbsolutePath, ""))
  );

export const getRemoteAttachments = (
  attachmentCount: number
): ReadonlyArray<ThirdPartyAttachment> =>
  pipe(
    path.join(assetsFolder, "messages", "remote", "attachments"),
    remoteAttachmentFolderAbsolutePath =>
      pipe(
        remoteAttachmentFolderAbsolutePath,
        listDir,
        A.map(fileNameWithExtension =>
          path.join(remoteAttachmentFolderAbsolutePath, fileNameWithExtension)
        ),
        thirdPartyAttachmentFromAbsolutePathArray(attachmentCount)
      )
  );

export const getThirdPartyMessagePrecondition =
  (): ThirdPartyMessagePrecondition =>
    validatePayload(ThirdPartyMessagePrecondition, {
      title: "Questo messaggio contiene una comunicazione a valore legale",
      markdown: thirdPartyMessagePreconditionMarkdown
    });
