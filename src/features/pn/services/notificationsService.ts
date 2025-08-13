import { Request } from "express";
import { Either, left, right } from "fp-ts/lib/Either";
import { isSome } from "fp-ts/lib/Option";
import { fakerIT as faker } from "@faker-js/faker";
import { ExpressFailure } from "../types/expressDTO";
import { PaymentsDatabase } from "../../../persistence/payments";
import { isProcessedPayment } from "../../../types/PaymentStatus";
import { Detail_v2Enum } from "../../../../generated/definitions/backend/PaymentProblemJson";
import { NotificationRepository } from "../repositories/notificationRepository";
import { getProblemJson } from "../../../payloads/error";
import { PreconditionContent } from "../../../../generated/definitions/pn/PreconditionContent";
import {
  Notification,
  NotificationHistory,
  NotificationRecipient
} from "./../models/Notification";

export const notificationFromRequestParams = (
  req: Request
): Either<ExpressFailure, { iun: string; notification: Notification }> => {
  const iun = req.params.iun;
  const notification = NotificationRepository.getNotification(iun);
  if (notification == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Notification not found",
        `Requested notification does not exist (iun: ${iun})`
      )
    });
  }
  return right({ iun, notification });
};

export const preconditionsForNotification = (
  notification: Notification
): PreconditionContent => {
  // This is not the real behaviour but we use the parameter to simulate the precondition's content switch
  if (notification.acknowledged) {
    return {
      title: "Questo messaggio contiene una comunicazione a valore legale",
      markdown: `Premendo “Continua”, la notifica risulterà legalmente recapitata a te, a meno che tu non abbia ricevuto la raccomandata cartacea da più di 10 giorni.\n\n__Mittente__\n${notification.senderDenomination}\n\n__Codice IUN__\n${notification.iun}`
    };
  }

  const referenceDate = faker.date.soon({ days: 5 });
  return {
    title: "Questo messaggio contiene una comunicazione a valore legale",
    markdown: `Premendo “Continua”, la notifica risulterà legalmente recapitata a te.\n**Se apri il messaggio entro il ${referenceDate
      .toISOString()
      .slice(0, 10)} alle ${referenceDate
      .toISOString()
      .slice(
        11,
        19
      )}**, eviterai di ricevere la raccomandata, i cui eventuali costi saranno calcolati in fase di pagamento.\n\n**Mittente**\n${
      notification.senderDenomination
    }\n\n**Codice IUN**\n${notification.iun}`
  };
};

export const notificationToThirdPartyMessage = (
  notification: Notification
) => ({
  attachments: attachmentsFromNotification(notification),
  details: {
    abstract: notification.abstract,
    completedPayments: completedPaymentsFromNotification(notification),
    iun: notification.iun,
    isCancelled: notification.cancelled,
    notificationStatusHistory: notificationStatusHistoryFromHistory(
      notification.history
    ),
    recipients: recipientsFromRecipients(notification.recipients),
    senderDenomination: notification.senderDenomination,
    subject: notification.subject
  }
});

const completedPaymentsFromNotification = (notification: Notification) =>
  notification.cancelled
    ? notification.recipients
        ?.filter(recipient => {
          if (recipient.paymentId == null) {
            return false;
          }
          const paymentStatusOption = PaymentsDatabase.getPaymentStatus(
            recipient.paymentId
          );
          if (isSome(paymentStatusOption)) {
            const paymentStatus = paymentStatusOption.value;
            if (isProcessedPayment(paymentStatus)) {
              return (
                paymentStatus.status.detail_v2 ===
                  Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO ||
                paymentStatus.status.detail_v2 ===
                  Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
              );
            }
          }
          return false;
        })
        .map(recipient => recipient.paymentId)
    : undefined;

const attachmentsFromNotification = (notification: Notification) =>
  notification.attachments?.map((attachment, index) => {
    const url =
      attachment.category === "DOCUMENT"
        ? `/delivery/notifications/received/${notification.iun}/attachments/documents/${attachment.index}`
        : `/delivery/notifications/received/${notification.iun}/attachments/payment/${attachment.category}?attachmentIdx=${attachment.index}`;
    return {
      id: `${index}`,
      url,
      content_type: attachment.contentType,
      name: attachment.filename,
      category: attachment.category
    };
  });

const notificationStatusHistoryFromHistory = (
  history: ReadonlyArray<NotificationHistory>
) => [...history];

const recipientsFromRecipients = (
  recipients: ReadonlyArray<NotificationRecipient> | undefined
) =>
  recipients?.map(recipient => ({
    denomination: recipient.denomination,
    payment:
      recipient.paymentId != null
        ? {
            creditorTaxId: recipient.paymentId.substring(0, 11),
            noticeCode: recipient.paymentId.substring(11)
          }
        : undefined,
    recipientType: recipient.type,
    taxId: recipient.recipientFiscalCode
  }));
