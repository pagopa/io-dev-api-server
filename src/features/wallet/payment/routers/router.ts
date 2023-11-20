import { Request, Response, Router } from "express";
import { addHandler, SupportedMethod } from "../../../../payloads/response";

export const paymentRouter = Router();

export const addECommercePrefix = (path: string) => `/ecommerce/io/v1${path}`;

export const addPaymentHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => addHandler(paymentRouter, method, addECommercePrefix(path), handleRequest);
