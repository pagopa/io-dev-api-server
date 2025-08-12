import { Request, Response } from "express";
import { initializeSENDRepositoriesIfNeeded } from "../repositories/utils";

// Middleware have to be used like this (instead of directly giving the middleware to the router via use)
// because supertest (when testing) calls every middleware upon test initialization, even if it not in a
// router directly called by the test, thus making every test fail due to the authentication middleware
export const initializationMiddleware =
  (nextRequest: (_req: Request, _res: Response) => void) =>
  (request: Request, response: Response) => {
    initializeSENDRepositoriesIfNeeded();
    nextRequest(request, response);
  };
