import { Request, Response } from "express";
import { APIKey } from "../models/APIKey";
import { getProblemJson } from "../../../payloads/error";
import { ioDevServerConfig } from "../../../config";

// Middleware have to be used like this (instead of directly giving the middleware to the router via use)
// because supertest (when testing) calls every middleware upon test initialization, even if it not in a
// router directly called by the test, thus making every test fail due to the authentication middleware
export const authenticationMiddleware =
  (nextRequest: (_req: Request, _res: Response) => void) =>
  (request: Request, response: Response) => {
    const verifyServerToServerAuthentication =
      !ioDevServerConfig.send.skipServerToServerAuthentication;
    if (verifyServerToServerAuthentication) {
      const apiKey = request.headers["x-api-key"];
      if (apiKey !== APIKey) {
        response
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
    }
    nextRequest(request, response);
  };
