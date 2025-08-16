import { Request, Response, Router } from "express";
import { addHandler } from "../../../payloads/response";
import {
  notificationFromRequestParams,
  notificationToThirdPartyMessage,
  preconditionsForNotification
} from "../services/notificationsService";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { checkAndValidateLollipopAndTaxId } from "../services/commonService";
import { handleLeftEitherIfNeeded } from "../../../utils/error";

const notificationDisclaimerPath =
  "/ext-registry-private/io/v1/notification-disclaimer/:iun";
const notificationPath = "/delivery/notifications/received/:iun";

export const generateNotificationDisclaimerPath = (iun: string) =>
  notificationDisclaimerPath.replace(":iun", iun);
export const generateNotificationPath = (iun: string) =>
  notificationPath.replace(":iun", iun);

export const sendNotificationsRouter = Router();

addHandler(
  sendNotificationsRouter,
  "get",
  notificationPath,
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
      const thirdPartyMessage = notificationToThirdPartyMessage(notification);
      res.status(200).json(thirdPartyMessage);
    })
  ),
  () => 500 + 1000 * Math.random()
);

addHandler(
  sendNotificationsRouter,
  "get",
  notificationDisclaimerPath,
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
      const preconditions = preconditionsForNotification(notification);
      res.status(200).json(preconditions);
    })
  ),
  () => 500 + 1000 * Math.random()
);
