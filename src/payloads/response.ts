import { Application, Request, Response, Router } from "express";
import { Millisecond } from "italia-ts-commons/lib/units";
import {
  basePath,
  IOApiPath,
  SupportedMethod
} from "../../generated/definitions/backend_api_paths";
import { IRouterMatcher } from "express-serve-static-core";

export type IOResponse<T> = {
  payload: T;
  status?: number;
  isJson?: boolean;
};

export const handleResponse = <T>(
  handler: (req: Request) => IOResponse<T>,
  delay: Millisecond
) => (req: Request, expressResponse: Response) => {
  const ioResponse = handler(req);
  const res = expressResponse.status(ioResponse.status || 200);
  if (ioResponse.isJson === true) {
    setTimeout(() => res.json(ioResponse.payload), delay);
    return;
  }
  setTimeout(() => res.send(ioResponse.payload), delay);
};

/**
 * ResponseHandler is an helper function to handle the IO API
 * it checks your are handling an existing api (IOApiPath)
 * it ensures handler give a response compliant with API spec (IOResponse<T>)
 */
export class ResponseHandler {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  private registerHandler = <T>(
    method: SupportedMethod,
    path: IOApiPath,
    handler: (req: Request) => IOResponse<T>,
    delay: Millisecond
  ): ResponseHandler => {
    const handlerWithDelay = handleResponse(handler, delay);
    switch (method) {
      case "get":
        this.app.get(basePath + path, handlerWithDelay);
        break;
      case "post":
        this.app.post(basePath + path, handlerWithDelay);
        break;
      case "put":
        this.app.put(basePath + path, handlerWithDelay);
        break;
      default:
        throw Error(`${method} not implemented`);
    }
    return this;
  };

  public addCustomHandler = <T>(
    method: SupportedMethod,
    path: IOApiPath,
    handler: (req: Request) => IOResponse<T>,
    delay: Millisecond = 0 as Millisecond
  ): ResponseHandler => {
    this.registerHandler(method, path, handler, delay);
    return this;
  };

  /**
   * Add an handler for the given api path
   * responsePayload will be sent as response to the request
   * It accepts only IOApiPath defined into the swagger specs (see api_beckend_specs value in package.json)
   */
  public addHandler = <T>(
    method: SupportedMethod,
    path: IOApiPath,
    responsePayload: IOResponse<T>,
    delay: Millisecond = 0 as Millisecond
  ): ResponseHandler => {
    this.registerHandler(method, path, () => responsePayload, delay);
    return this;
  };
}

export const installHandler = <T>(
  router: Router,
  method: SupportedMethod,
  path: string,
  response: (request: Request) => IOResponse<T>,
  delay: Millisecond = 0 as Millisecond
) => {
  router[method](path, (req, res) => {
    const responsePayload = response(req);
    const expressResponse = res.status(responsePayload.status || 200);
    if (responsePayload.isJson === true) {
      setTimeout(() => expressResponse.json(responsePayload.payload), delay);
      return;
    }
    setTimeout(() => expressResponse.send(responsePayload.payload), delay);
  });
};
