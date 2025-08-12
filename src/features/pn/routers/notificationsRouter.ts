import { Request, Response, Router } from "express";
import { Either, isLeft, Left } from "fp-ts/lib/Either";
import { addHandler } from "../../../payloads/response";
import {
  checkAndValidateTaxIdHeader,
  notificationFromRequestParams,
  notificationToThirdPartyMessage,
  preconditionsForNotification
} from "../services/notificationsService";
import { checkAndValidateLollipopHeaders } from "../services/lollipopService";
import { ExpressFailure } from "../types/expressFailure";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";

export const getNotificationDisclaimerPath =
  "/ext-registry-private/io/v1/notification-disclaimer";
export const getNotificationPath = "/delivery/notifications/received";

export const sendNotificationsRouter = Router();

addHandler(
  sendNotificationsRouter,
  "get",
  `${getNotificationPath}/:iun`,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      const lollipopHeadersEither = checkAndValidateLollipopHeaders(
        req.headers
      );
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
    })
  ),
  () => 500 + 1000 * Math.random()
);

addHandler(
  sendNotificationsRouter,
  "get",
  `${getNotificationDisclaimerPath}/:iun`,
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      const lollipopHeadersEither = checkAndValidateLollipopHeaders(
        req.headers
      );
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
    })
  ),
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
