import { Application, Request, Response } from "express";
import {
  basePath,
  IOApiPath,
  SupportedMethod
} from "../../generated/definitions/backend_api_paths";
import { Millisecond } from "italia-ts-commons/lib/units";

export type IOResponse<T> = {
  payload: T;
  status?: number;
  isJson?: boolean;
};

export const handleResponse = <T>(
  expressResponse: Response,
  ioResponse: IOResponse<T>,
  delay: Millisecond
) => {
  const res = expressResponse.status(ioResponse.status || 200);
  if (ioResponse.isJson === true) {
    setTimeout(() => res.json(ioResponse.payload), delay);
    return;
  }
  setTimeout(() => res.send(ioResponse.payload), delay);
};

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
    switch (method) {
      case "get":
        this.app.get(basePath + path, (req, res) =>
          handleResponse(res, handler(req), delay)
        );
        break;
      case "post":
        this.app.post(basePath + path, (req, res) =>
          handleResponse(res, handler(req), delay)
        );
        break;
      case "put":
        this.app.put(basePath + path, (req, res) =>
          handleResponse(res, handler(req), delay)
        );
        break;
      case "update":
        throw Error("update method not implemented");
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
