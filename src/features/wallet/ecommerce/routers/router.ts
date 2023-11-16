import { Request, Response, Router } from "express";
import { addHandler, SupportedMethod } from "../../../../payloads/response";

export const eCommerceRouter = Router();

export const addECommercePrefix = (path: string) => `/ecommerce/io/v1${path}`;

export const addECommerceHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) =>
  addHandler(eCommerceRouter, method, addECommercePrefix(path), handleRequest);
