import { Request, Response, Router } from "express";
import { addHandler } from "../../../payloads/response";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { MandateRepository } from "../repositories/mandateRepository";
import { checkAndValidateLollipopAndTaxId } from "../services/commonService";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { ioDevServerConfig } from "../../../config";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
import { checkAndCreateValidationCode } from "../services/mandateService";

const createMandatePath = "/mandate/api/v2/mandate";
export const generateCreateMandatePath = () => createMandatePath;

const acceptMandatePath = "/mandate/api/v2/cie/:mandateId/accept";
export const generateAcceptMandatePath = (mandateId: string) =>
  acceptMandatePath.replace(":mandateId", mandateId);

export const sendMandatesRouter = Router();

addHandler(
  sendMandatesRouter,
  "post",
  createMandatePath,
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
      const validationCodeEither = checkAndCreateValidationCode(
        req.body,
        taxIdEither.right
      );
      if (handleLeftEitherIfNeeded(validationCodeEither, res)) {
        return;
      }
      const validationCode = validationCodeEither.right;
      res.status(200).json({
        mandateId: validationCode.mandateId,
        timeToLive: validationCode.timeToLive,
        validationCode: validationCode.validationCode
      });
    })
  )
);

addHandler(
  sendMandatesRouter,
  "get",
  "/send/private/mandates",
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  initializationMiddleware((_req: Request, res: Response) => {
    const mandateList = MandateRepository.getMandateList();
    res.status(200).json(mandateList);
  })
);
