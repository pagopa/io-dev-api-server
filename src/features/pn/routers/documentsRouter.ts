import { Request, Response, Router } from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { addHandler } from "../../../payloads/response";
import { notificationFromRequestParams } from "../services/notificationsService";
import { checkAndValidateLollipopAndTaxId } from "../services/commonService";
import {
  checkAndValidateAttachmentIndex,
  checkAndValidateAttachmentName,
  notificationAttachmentDownloadMetadataResponseForAttachment
} from "../services/documentsService";
import { DocumentCategory } from "../models/Document";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
import { ioDevServerConfig } from "../../../config";

const documentPath =
  "/delivery/notifications/received/:iun/attachments/documents/:docIdx";
const paymentDocumentPath =
  "/delivery/notifications/received/:iun/attachments/payment/:attachmentName";

export const generateDocumentPath = (iun: string, index: string) =>
  documentPath.replace(":iun", iun).replace(":docIdx", index.toString());
export const generatePaymentDocumentPath = (
  iun: string,
  index: string,
  category: Extract<DocumentCategory, "F24" | "PAGOPA">
) =>
  `${paymentDocumentPath
    .replace(":iun", iun)
    .replace(":attachmentName", category)}?attachmentIdx=${index}`;

export const sendDocumentsRouter = Router();

addHandler(
  sendDocumentsRouter,
  "get",
  documentPath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      if (!checkAndValidateLollipopAndTaxId(ioDevServerConfig.send, req, res)) {
        return;
      }
      const notificationEither = notificationFromRequestParams(req);
      if (handleLeftEitherIfNeeded(notificationEither, res)) {
        return;
      }
      const { notification } = notificationEither.right;
      const docIdxEither = checkAndValidateAttachmentIndex(
        "DOCUMENT",
        notification,
        req
      );
      if (handleLeftEitherIfNeeded(docIdxEither, res)) {
        return;
      }
      const docIdx = docIdxEither.right;
      const notificationAttachmentDownloadMetadataResponseEither =
        notificationAttachmentDownloadMetadataResponseForAttachment(
          docIdx,
          "DOCUMENT"
        );
      if (
        handleLeftEitherIfNeeded(
          notificationAttachmentDownloadMetadataResponseEither,
          res
        )
      ) {
        return;
      }
      res
        .status(200)
        .json(notificationAttachmentDownloadMetadataResponseEither.right);
    })
  ),
  () => 500 + 1000 * Math.random()
);

addHandler(
  sendDocumentsRouter,
  "get",
  paymentDocumentPath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      if (!checkAndValidateLollipopAndTaxId(ioDevServerConfig.send, req, res)) {
        return;
      }
      const notificationEither = notificationFromRequestParams(req);
      if (handleLeftEitherIfNeeded(notificationEither, res)) {
        return;
      }
      const { notification } = notificationEither.right;
      const attachmentCategoryEither = checkAndValidateAttachmentName(req);
      if (handleLeftEitherIfNeeded(attachmentCategoryEither, res)) {
        return;
      }
      const attachmentIdxEither = checkAndValidateAttachmentIndex(
        attachmentCategoryEither.right,
        notification,
        req
      );
      if (handleLeftEitherIfNeeded(attachmentIdxEither, res)) {
        return;
      }
      const atachmentIdx = attachmentIdxEither.right;
      const notificationAttachmentDownloadMetadataResponseEither =
        notificationAttachmentDownloadMetadataResponseForAttachment(
          atachmentIdx,
          attachmentCategoryEither.right
        );
      if (
        handleLeftEitherIfNeeded(
          notificationAttachmentDownloadMetadataResponseEither,
          res
        )
      ) {
        return;
      }
      res
        .status(200)
        .json(notificationAttachmentDownloadMetadataResponseEither.right);
    })
  ),
  () => 500 + 1000 * Math.random()
);
