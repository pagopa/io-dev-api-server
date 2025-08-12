import { NextFunction, Request, Response, Router } from "express";
import { Either, isLeft, Left } from "fp-ts/lib/Either";
import { addHandler } from "../../../payloads/response";
import { initializeSENDRepositoriesIfNeeded } from "../repositories/utils";
import {
  checkAndValidateTaxIdHeader,
  notificationFromRequestParams,
  notificationToThirdPartyMessage,
  preconditionsForNotification
} from "../services/notificationsService";
import { checkAndValidateLollipopHeaders } from "../services/lollipopService";
import { ExpressFailure } from "../types/expressFailure";
import { APIKey } from "../models/APIKey";
import { getProblemJson } from "../../../payloads/error";

export const getNotificationDisclaimerPath =
  "/ext-registry-private/io/v1/notification-disclaimer";
export const getNotificationPath = "/delivery/notifications/received";

export const sendNotificationsRouter = Router();

sendNotificationsRouter.use(
  async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== APIKey) {
      res
        .status(401)
        .json(
          getProblemJson(
            401,
            "Unauthorized API Access",
            `Missing or invalid value for header 'x-api-key'`
          )
        );
      return;
    }
    initializeSENDRepositoriesIfNeeded();
    next();
  }
);

addHandler(
  sendNotificationsRouter,
  "get",
  `${getNotificationPath}/:iun`,
  (req: Request, res: Response) => {
    const lollipopHeadersEither = checkAndValidateLollipopHeaders(req.headers);
    if (handleLeftEitherIfNeeded(lollipopHeadersEither, res)) {
      return;
    }
    const taxIdEither = checkAndValidateTaxIdHeader(
      req.headers,
      lollipopHeadersEither.right
    );
    if (handleLeftEitherIfNeeded(taxIdEither, res)) {
      return;
    }
    const notificationEither = notificationFromRequestParams(req);
    if (handleLeftEitherIfNeeded(notificationEither, res)) {
      return;
    }
    const { notification } = notificationEither.right;
    const thirdPartyMessage = notificationToThirdPartyMessage(notification);
    res.status(200).json(thirdPartyMessage);
  },
  () => 500 + 1000 * Math.random()
);

addHandler(
  sendNotificationsRouter,
  "get",
  `${getNotificationDisclaimerPath}/:iun`,
  (req: Request, res: Response) => {
    const lollipopHeadersEither = checkAndValidateLollipopHeaders(req.headers);
    if (handleLeftEitherIfNeeded(lollipopHeadersEither, res)) {
      return;
    }
    const taxIdEither = checkAndValidateTaxIdHeader(
      req.headers,
      lollipopHeadersEither.right
    );
    if (handleLeftEitherIfNeeded(taxIdEither, res)) {
      return;
    }
    const notificationEither = notificationFromRequestParams(req);
    if (handleLeftEitherIfNeeded(notificationEither, res)) {
      return;
    }
    const { notification } = notificationEither.right;
    const preconditions = preconditionsForNotification(notification);
    res.status(200).json(preconditions);
  },
  () => 500 + 1000 * Math.random()
);

const handleLeftEitherIfNeeded = (
  inputEither: Either<ExpressFailure, unknown>,
  res: Response
): inputEither is Left<ExpressFailure> => {
  if (isLeft(inputEither)) {
    res.status(inputEither.left.httpStatusCode).json(inputEither.left.reason);
    return true;
  }
  return false;
};
