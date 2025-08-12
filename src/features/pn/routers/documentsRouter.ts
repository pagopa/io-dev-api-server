import { Request, Response, Router } from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { getProblemJson } from "../../../payloads/error";
import { addHandler } from "../../../payloads/response";
import { notificationFromRequestParams } from "../services/notificationsService";
import {
  checkAndValidateLollipopAndTaxId,
  handleLeftEitherIfNeeded
} from "../services/commonService";
import { checkAndValidateAttachmentIndex } from "../services/documentsService";

export const getDocumentPath =
  "/delivery/notifications/received/:iun/attachments/documents/:docIdx";
export const getF24Path =
  "delivery/notifications/received/:iun/attachments/payment/:attachmentName";

export const sendDocumentsRouter = Router();

addHandler(
  sendDocumentsRouter,
  "get",
  getDocumentPath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      if (!checkAndValidateLollipopAndTaxId(req, res)) {
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
      // const docIdx = docIdxEither.right;
      // TODO
      res.status(500).json(getProblemJson(500));
    })
  ),
  () => 500 + 1000 * Math.random()
);
