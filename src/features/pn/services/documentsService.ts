/* eslint-disable sonarjs/no-duplicate-string */
import { Request } from "express";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { ExpressFailure } from "../types/expressDTO";
import { getProblemJson } from "../../../payloads/error";
import { Notification } from "../models/Notification";
import { Document, DocumentCategory } from "../models/Document";
import { DocumentsRepository } from "../repositories/documentRepository";
import { NotificationAttachmentDownloadMetadataResponse } from "../../../../generated/definitions/pn/NotificationAttachmentDownloadMetadataResponse";
import { serverUrl } from "../../../utils/server";
import { generatePrevalidatedUriPath } from "../routers/prevalidatedUrisRouter";
import { PrevalidatedUrisRepository } from "../repositories/prevalidatedUrisRepository";
import { generateUriForRelativePath } from "./prevalidatedUrisService";

export const checkAndValidateAttachmentName = (
  req: Request
): Either<ExpressFailure, Extract<DocumentCategory, "F24" | "PAGOPA">> => {
  const attachmentName = req.params.attachmentName;
  if (attachmentName == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        `Missing 'attachmentName' in path`,
        `No value found for path parameter 'attachmentName' (${attachmentName})`
      )
    });
  }

  const upperCaseAttachmentName = attachmentName.toUpperCase();
  if (
    upperCaseAttachmentName !== "F24" &&
    upperCaseAttachmentName !== "PAGOPA"
  ) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        `Bad value for 'attachmentName'`,
        `Value for path parameter 'attachmentName' is not valid (${attachmentName})`
      )
    });
  }
  return right(upperCaseAttachmentName);
};

export const checkAndValidateAttachmentIndex = (
  documentCategory: DocumentCategory,
  notification: Notification,
  req: Request
): Either<ExpressFailure, number> => {
  const isDocument = documentCategory === "DOCUMENT";
  const parameterName = isDocument ? "docIdx" : "attachmentName";
  const attachmentIndexString = isDocument
    ? req.params[parameterName]
    : req.query[parameterName];
  const attachmentIndex = Number(attachmentIndexString);
  if (Number.isNaN(attachmentIndex)) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        `Bad parameter '${parameterName}'`,
        `Missing or bad value for ${
          isDocument ? "path" : "query"
        } parameter '${parameterName}' (${attachmentIndexString})`
      )
    });
  }
  const attachment = notification.attachments?.find(
    attachment =>
      attachment.category === documentCategory &&
      attachment.index === attachmentIndex
  );
  if (attachment == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Attachment not found",
        `Notification with iun (${notification.iun}) does not have an attachment of type '${documentCategory}' and index ${attachmentIndex}`
      )
    });
  }
  return right(attachmentIndex);
};

export const notificationAttachmentDownloadMetadataResponseForDocument = (
  index: number,
  category: DocumentCategory
): Either<ExpressFailure, NotificationAttachmentDownloadMetadataResponse> => {
  if (category === "DOCUMENT") {
    const documentEither = DocumentsRepository.documentAtIndex(index);
    if (isLeft(documentEither)) {
      return left({
        httpStatusCode: 400,
        reason: getProblemJson(
          400,
          "Document not found",
          `Document not found for index (${index})`
        )
      });
    }
    const notificationAttachmentDownloadMetadataResponseEither =
      documentToNotificationAttachmentDownloadMetadataResponse(
        documentEither.right,
        false
      );
    if (isLeft(notificationAttachmentDownloadMetadataResponseEither)) {
      return left({
        httpStatusCode: 500,
        reason: getProblemJson(
          500,
          "Invalid data structure for NotificationAttachmentDownloadMetadataResponse",
          `Conversion from Document to NotificationAttachmentDownloadMetadataResponse produced ad invalid data structure (${notificationAttachmentDownloadMetadataResponseEither.left})`
        )
      });
    }
    return right(notificationAttachmentDownloadMetadataResponseEither.right);
  } else {
    const paymentDocumentEither =
      DocumentsRepository.paymentDocumentAtIndex(index);
    if (isLeft(paymentDocumentEither)) {
      return left({
        httpStatusCode: 400,
        reason: getProblemJson(
          400,
          `F24 not found`,
          `F24 not found for index (${index})`
        )
      });
    }
    const f24 = paymentDocumentEither.right;

    const now = new Date();
    const isRetryAfter =
      f24.availableFrom == null ||
      f24.availableUntil == null ||
      now < f24.availableFrom;
    if (isRetryAfter) {
      const shouldUpdateAvailabilityRange =
        f24.availableFrom == null ||
        f24.availableUntil == null ||
        f24.availableUntil < now;
      if (shouldUpdateAvailabilityRange) {
        const updatedF24Either =
          DocumentsRepository.updateAvailabilityRangeForPaymentDocumentAtIndex(
            index
          );
        if (isLeft(updatedF24Either)) {
          return left({
            httpStatusCode: 500,
            reason: getProblemJson(
              500,
              `Availability range update failed`,
              `Unable to updated availability range for payment document at index (${index})`
            )
          });
        }
      }
      const notificationAttachmentDownloadMetadataResponseEither =
        documentToNotificationAttachmentDownloadMetadataResponse(f24, true);
      if (isLeft(notificationAttachmentDownloadMetadataResponseEither)) {
        return left({
          httpStatusCode: 500,
          reason: getProblemJson(
            500,
            "Invalid data structure for NotificationAttachmentDownloadMetadataResponse",
            `Conversion from Document to NotificationAttachmentDownloadMetadataResponse produced ad invalid data structure (${notificationAttachmentDownloadMetadataResponseEither.left})`
          )
        });
      }
      return right(notificationAttachmentDownloadMetadataResponseEither.right);
    }

    const notificationAttachmentDownloadMetadataResponseEither =
      documentToNotificationAttachmentDownloadMetadataResponse(f24, false);
    if (isLeft(notificationAttachmentDownloadMetadataResponseEither)) {
      return left({
        httpStatusCode: 500,
        reason: getProblemJson(
          500,
          "Invalid data structure for NotificationAttachmentDownloadMetadataResponse",
          `Conversion from Document to NotificationAttachmentDownloadMetadataResponse produced ad invalid data structure (${notificationAttachmentDownloadMetadataResponseEither.left})`
        )
      });
    }
    return right(notificationAttachmentDownloadMetadataResponseEither.right);
  }
};

const documentToNotificationAttachmentDownloadMetadataResponse = (
  document: Document,
  isRetryAfter: boolean
): Either<string, NotificationAttachmentDownloadMetadataResponse> => {
  const uri = generateUriForRelativePath(document.relativePath);
  const prevalidatedUriPath = generatePrevalidatedUriPath(uri);
  const url = `${serverUrl}${prevalidatedUriPath}`;

  const responseDocument = {
    contentLength: document.contentLength,
    contentType: document.contentType,
    filename: document.filename,
    retryAfter: isRetryAfter
      ? DocumentsRepository.getPaymentDocumentRetryAfterSeconds()
      : undefined,
    sha256: document.sha256,
    url: !isRetryAfter ? url : undefined
  };
  const notificationAttachmentDownloadMetadataResponseEither =
    NotificationAttachmentDownloadMetadataResponse.decode(responseDocument);
  if (isLeft(notificationAttachmentDownloadMetadataResponseEither)) {
    return left(
      readableReport(notificationAttachmentDownloadMetadataResponseEither.left)
    );
  }

  if (!isRetryAfter) {
    PrevalidatedUrisRepository.setPrevalidatedUri(uri);
  }

  return notificationAttachmentDownloadMetadataResponseEither;
};
