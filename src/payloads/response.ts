import { Application, Request, Response, Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { Millisecond } from "italia-ts-commons/lib/units";
import {
  basePath,
  IOApiPath,
  SupportedMethod
} from "../../generated/definitions/backend_api_paths";
import { validatePayload } from "../utils/validator";

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
  const executeRes = () =>
    ioResponse.isJson
      ? res.json(ioResponse.payload)
      : res.send(ioResponse.payload);
  if (delay > 0) {
    setTimeout(executeRes, delay);
    return;
  }
  executeRes();
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

export const installHandler = <T, O, I>(
  router: Router,
  method: SupportedMethod,
  path: string,
  response: (request: Request) => any,
  codec?: t.Type<T, O, I>,
  delay: Millisecond = 0 as Millisecond
) => {
  router[method](path, (req, res) => {
    const responsePayload = response(req);
    fromNullable(codec).map(c => validatePayload(c, responsePayload));
    const expressResponse = res.status(responsePayload.status || 200);
    const executeRes = () =>
      responsePayload.isJson
        ? expressResponse.json(responsePayload.payload)
        : expressResponse.send(responsePayload.payload);
    if (delay > 0) {
      setTimeout(executeRes, delay);
      return;
    }
    executeRes();
  });
};
