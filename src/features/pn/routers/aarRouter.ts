import { Request, Response, Router } from "express";
import { addHandler } from "../../../payloads/response";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { AARRepository } from "../repositories/aarRepository";

const checkQRCodePath = "/delivery/notifications/received/check-qr-code";

export const generateCheckQRPath = () => checkQRCodePath;

export const sendAARRouter = Router();

addHandler(
  sendAARRouter,
  "get",
  "/send/private/aars",
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  initializationMiddleware((_req: Request, res: Response) => {
    const qrCodeList = AARRepository.getQRCodes();
    res.status(200).json(qrCodeList);
  })
);
