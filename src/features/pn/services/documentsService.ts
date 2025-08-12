import { Request } from "express";
import { Either, left, right } from "fp-ts/lib/Either";
import { ExpressFailure } from "../types/expressFailure";
import { getProblemJson } from "../../../payloads/error";
import { Notification } from "../models/Notification";
import { DocumentCategory } from "../models/Document";

export const checkAndValidateAttachmentIndex = (
  documentCategory: DocumentCategory,
  notification: Notification,
  req: Request
): Either<ExpressFailure, number> => {
  const parameterName =
    documentCategory === "DOCUMENT" ? "docIdx" : "attachmentName";
  const attachmentIndexString = req.params[parameterName];
  const attachmentIndex = Number(attachmentIndexString);
  if (Number.isNaN(attachmentIndex)) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        `Bad parameter '${parameterName}'`,
        `Missing or bad value for path parameter '${parameterName}' (${attachmentIndexString})`
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
        "Attachmnet not found",
        `Notification with iun (${notification.iun}) does not have an attachment of type '${documentCategory}' and index ${attachmentIndex}`
      )
    });
  }
  return right(attachmentIndex);
};
