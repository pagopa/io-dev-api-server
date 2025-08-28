import { Request, Response, Router } from "express";
import { addHandler } from "../../../payloads/response";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { AARRepository } from "../repositories/aarRepository";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { checkAndValidateLollipopAndTaxId } from "../services/commonService";
import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
import {
  acceptToSForAAR,
  notificationOrMandateDataFromQRCode
} from "../services/aarService";
import { logExpressWarning } from "../../../utils/logging";

const checkQRCodePath = "/delivery/notifications/received/check-qr-code";
const acceptToSPath = "/user-consents/v1/consents/:consentType";

export const generateCheckQRPath = () => checkQRCodePath;
export const generateAcceptToSPath = (consentType: string, version: string) => {
  const path = acceptToSPath.replace(":consentType", consentType);
  return `${path}?version=${version}`;
};

export const sendAARRouter = Router();

addHandler(
  sendAARRouter,
  "post",
  checkQRCodePath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      const taxIdEither = checkAndValidateLollipopAndTaxId(
        ioDevServerConfig.send,
        req
      );
      if (handleLeftEitherIfNeeded(taxIdEither, res)) {
        return;
      }
      const { qrcode: inputQRCodeContent } = req.body;
      if (typeof inputQRCodeContent !== "string") {
        const problemJson = getProblemJson(
          400,
          "Bad body value",
          `Request body does not contain a valid JSON with the 'qrcode' property (${inputQRCodeContent})`
        );
        logExpressWarning(400, problemJson);
        res.status(400).json(problemJson);
        return;
      }
      const notificationOrMandateDataEither =
        notificationOrMandateDataFromQRCode(
          inputQRCodeContent,
          taxIdEither.right
        );
      if (handleLeftEitherIfNeeded(notificationOrMandateDataEither, res)) {
        return;
      }
      res.status(200).json(notificationOrMandateDataEither.right);
    })
  )
);

addHandler(
  sendAARRouter,
  "put",
  acceptToSPath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      const taxIdEither = checkAndValidateLollipopAndTaxId(
        ioDevServerConfig.send,
        req
      );
      if (handleLeftEitherIfNeeded(taxIdEither, res)) {
        return;
      }
      const consentType = req.params.consentType;
      const updatedAAREither = acceptToSForAAR(
        consentType,
        req.query,
        req.body
      );
      if (handleLeftEitherIfNeeded(updatedAAREither, res)) {
        return;
      }
      res.status(200).json();
    })
  )
);

addHandler(
  sendAARRouter,
  "get",
  "/send/private/aars",
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  initializationMiddleware((_req: Request, res: Response) => {
    const qrCodeList = AARRepository.getAARList();
    res.status(200).json(qrCodeList);
  })
);
