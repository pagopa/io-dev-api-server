import { Request, Response, Router } from "express";
import { addHandler } from "../../../payloads/response";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { MandateRepository } from "../repositories/mandateRepository";

export const sendMandatesRouter = Router();

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
