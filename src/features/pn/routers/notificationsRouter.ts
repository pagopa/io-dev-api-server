import { NextFunction, Request, Response, Router } from "express";
import { isLeft } from "fp-ts/lib/Either";
import { addHandler } from "../../../payloads/response";
import { initializeSENDRepositoriesIfNeeded } from "../repositories/utils";
import {
  notificationFromRequestParams,
  notificationToThirdPartyMessage,
  preconditionsForNotification
} from "../services/notificationsService";

export const sendNotificationsRouter = Router();

sendNotificationsRouter.use(
  async (_req: Request, _res: Response, next: NextFunction) => {
    initializeSENDRepositoriesIfNeeded();
    next();
  }
);

export const getNotificationDisclaimerPath =
  "/ext-registry-private/io/v1/notification-disclaimer";
export const getNotificationPath = "/delivery/notifications/received";

addHandler(
  sendNotificationsRouter,
  "get",
  `${getNotificationPath}/:iun`,
  (req: Request, res: Response) => {
    const notificationEither = notificationFromRequestParams(req);
    if (isLeft(notificationEither)) {
      res
        .status(notificationEither.left.httpStatusCode)
        .json(notificationEither.left.reason);
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
    const notificationEither = notificationFromRequestParams(req);
    if (isLeft(notificationEither)) {
      res
        .status(notificationEither.left.httpStatusCode)
        .json(notificationEither.left.reason);
      return;
    }
    const { notification } = notificationEither.right;
    const preconditions = preconditionsForNotification(notification);
    res.status(200).json(preconditions);
  },
  () => 500 + 1000 * Math.random()
);
