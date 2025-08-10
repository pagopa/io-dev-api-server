/* eslint-disable functional/immutable-data */
import { fakerIT as faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { rptIdFromPaymentDataWithRequiredPayee } from "../../../utils/payment";
import {
  Notification,
  NotificationHistory,
  NotificationRecipient
} from "../models/Notification";
import {
  SendConfig,
  SendPaymentConfig,
  SendTimelineConfig
} from "../types/sendConfig";
import { Document, DocumentCategory } from "../models/Document";
import { OrganizationName } from "../../../../generated/definitions/backend/OrganizationName";
import { Detail_v2Enum } from "../../../../generated/definitions/backend/PaymentProblemJson";
import { IPaymentsDatabase } from "../../../persistence/payments";
import { IDocumentsRepository } from "./documentRepository";

const notifications = new Map<string, Notification>();

export interface INotificationRepository {
  initializeIfNeeded: (
    config: SendConfig,
    devServerUserFiscalCode: string,
    documentsRepository: IDocumentsRepository,
    organizationFiscalCode: OrganizationFiscalCode,
    organizationName: string,
    paymentsRepository: IPaymentsDatabase
  ) => Either<string, boolean>;
  getNotification: (iun: string) => Notification | undefined;
}

const getNotification = (iun: string): Notification | undefined =>
  notifications.get(iun);

const initializeIfNeeded = (
  config: SendConfig,
  devServerUserFiscalCode: string,
  documentsRepository: IDocumentsRepository,
  organizationFiscalCode: OrganizationFiscalCode,
  organizationName: string,
  paymentsRepository: IPaymentsDatabase
): Either<string, boolean> => {
  if (notifications.size > 0) {
    return right(false);
  }
  for (const notificationConfig of config.sendNotifications) {
    const abstract =
      notificationConfig.abstract ??
      [...Array(faker.number.int({ min: 1, max: 5 })).keys()]
        .map(_ => faker.word.words(faker.number.int({ min: 9, max: 45 })))
        .join("\n\n");
    const acknowledged = notificationConfig.acknowledged ?? false;
    const cancelled = notificationConfig.cancelled ?? false;
    const iun = notificationConfig.iun ?? ulid();
    const senderDenomination =
      notificationConfig.senderDenomination ?? faker.company.name();
    const subject =
      notificationConfig.subject ??
      faker.word.words(faker.number.int({ min: 3, max: 5 }));
    const userIsRecipient = notificationConfig.userIsRecipient ?? true;
    const notificationFiscalCode = userIsRecipient
      ? devServerUserFiscalCode
      : generateFiscalCodePlaceholder();

    const attachmentsConfig = notificationConfig.attachments;
    const attachmentsEither = attachmentsFromAttachmentConfig(
      attachmentsConfig,
      documentsRepository
    );
    if (isLeft(attachmentsEither)) {
      return attachmentsEither;
    }

    const paymentsConfig = notificationConfig.payments;
    const paymentsEither = recipientsFromPaymentsConfig(
      organizationFiscalCode,
      organizationName,
      paymentsConfig,
      paymentsRepository,
      notificationFiscalCode
    );
    if (isLeft(paymentsEither)) {
      return paymentsEither;
    }

    const timelineConfig = notificationConfig.timeline;
    const timeline = timelineFromTimelineConfig(timelineConfig);

    notifications.set(iun, {
      abstract,
      acknowledged,
      attachments: attachmentsEither.right,
      cancelled,
      history: timeline,
      iun,
      recipientFiscalCode: notificationFiscalCode,
      recipients: paymentsEither.right,
      senderDenomination,
      subject
    });
  }
  return right(true);
};

const generateFiscalCodePlaceholder = (): string =>
  faker.helpers.fromRegExp(
    /[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]/
  );

const attachmentsFromAttachmentConfig = (
  attachmentsConfig: ReadonlyArray<DocumentCategory> | undefined,
  documentsRepository: IDocumentsRepository
): Either<string, ReadonlyArray<Document> | undefined> => {
  if (attachmentsConfig == null) {
    return right(undefined);
  }

  const attachments: Document[] = [];
  for (const [index, attachmentConfig] of attachmentsConfig.entries()) {
    if (attachmentConfig === "F24") {
      const f24Either = documentsRepository.f24AtIndex(index);
      if (isLeft(f24Either)) {
        return f24Either;
      }
      attachments.push(f24Either.right);
    } else {
      const documentEither = documentsRepository.documentAtIndex(index);
      if (isLeft(documentEither)) {
        return documentEither;
      }
      attachments.push(documentEither.right);
    }
  }
  return right(attachments);
};

const recipientsFromPaymentsConfig = (
  organizationFiscalCode: OrganizationFiscalCode,
  organizationName: string,
  paymentsConfig: ReadonlyArray<SendPaymentConfig> | undefined,
  paymentsDatabase: IPaymentsDatabase,
  recipientFiscalCode: string
): Either<string, ReadonlyArray<NotificationRecipient> | undefined> => {
  const denomination = faker.company.name();
  const recipients = new Array<NotificationRecipient>();
  if (paymentsConfig == null || paymentsConfig.length === 0) {
    recipients.push({
      denomination,
      paymentId: undefined,
      recipientFiscalCode,
      type: "PF"
    });
  } else {
    for (const paymentConfig of paymentsConfig) {
      const paymentDataEither = paymentsDatabase.createPaymentData(
        organizationFiscalCode
      );
      if (isLeft(paymentDataEither)) {
        return left(paymentDataEither.left.join("\n"));
      }
      const rptId = rptIdFromPaymentDataWithRequiredPayee(
        paymentDataEither.right
      );
      switch (paymentConfig) {
        case "EXPIRED":
          paymentsDatabase.createProcessedPayment(
            rptId,
            Detail_v2Enum.PAA_PAGAMENTO_SCADUTO
          );
          break;
        case "ONGOING":
          paymentsDatabase.createProcessedPayment(
            rptId,
            Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO
          );
          break;
        case "PAID":
          paymentsDatabase.createProcessedPayment(
            rptId,
            Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
          );
          break;
        case "REVOKED":
          paymentsDatabase.createProcessedPayment(
            rptId,
            Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
          );
          break;
        case "TOPAY":
        case "UNRELATED":
          paymentsDatabase.createProcessablePayment(
            rptId,
            paymentDataEither.right.amount,
            organizationFiscalCode,
            organizationName as OrganizationName
          );
          break;
        default:
          paymentsDatabase.createProcessedPayment(
            rptId,
            Detail_v2Enum.GENERIC_ERROR
          );
          break;
      }
      recipients.push({
        denomination,
        paymentId: rptId,
        recipientFiscalCode:
          paymentConfig !== "UNRELATED"
            ? recipientFiscalCode
            : generateFiscalCodePlaceholder(),
        type: "PF"
      });
    }
  }
  return right(recipients);
};

const timelineFromTimelineConfig = (
  timelineConfig: ReadonlyArray<SendTimelineConfig> | undefined
): ReadonlyArray<NotificationHistory> => {
  const baseTimelineConfig =
    timelineConfig != null
      ? timelineConfig
      : faker.helpers.arrayElements(
          [
            "ACCEPTED",
            "CANCELLED",
            "DELIVERED",
            "DELIVERING",
            "EFFECTIVE_DATE",
            "IN_VALIDATION",
            "PAID",
            "REFUSED",
            "VIEWED",
            "UNREACHABLE"
          ],
          faker.number.int({ min: 3, max: 7 })
        );
  const baseDate = faker.date.recent({ days: baseTimelineConfig.length });
  const timeline: ReadonlyArray<NotificationHistory> = baseTimelineConfig.map(
    (status, index) => ({
      activeFrom: addMinutesToDate(baseDate, index),
      relatedTimelineElements: [...Array(faker.number.int(5)).keys()].map(
        index =>
          `${faker.string.alphanumeric(31)}${index}${faker.string.alphanumeric(
            32
          )}`
      ),
      status
    })
  );
  return timeline;
};

const addMinutesToDate = (date: Date, minutesToAdd: number): Date => {
  // Create a new Date object from the input date to avoid modifying the original date.
  const newDate = new Date(date.getTime());

  // Get the current minutes from the new date and add the specified minutes.
  // The setMinutes method automatically handles rolling over to the next hour, day, month, or year.
  newDate.setMinutes(newDate.getMinutes() + minutesToAdd);

  // Return the new date object.
  return newDate;
};

export const NotificationRepository: INotificationRepository = {
  initializeIfNeeded,
  getNotification
};
