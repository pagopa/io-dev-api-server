import { Request, Response, Router } from "express";
import { addHandler, SupportedMethod } from "../../../payloads/response";

export const cdcRouter = Router();

const cdcPrefix = "/api/v1/cdc";

const addCdcPrefix = (path: string) => `${cdcPrefix}${path}`;

export const addCdcHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => addHandler(cdcRouter, method, addCdcPrefix(path), handleRequest);
