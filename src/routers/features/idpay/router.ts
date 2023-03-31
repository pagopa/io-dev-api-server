import { Request, Response, Router } from "express";
import { addHandler, SupportedMethod } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";

export const idpayRouter = Router();

const addIdPayPrefix = (path: string) => `/idpay${path}`;

export const addIdPayHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => addHandler(idpayRouter, method, addIdPayPrefix(path), handleRequest);
