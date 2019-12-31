import { Application, Request, Response } from "express";
import {
  basePath,
  IOApiPath,
  SupportedMethod
} from "../generated/definitions/backend_api_paths";

export type IOResponse = {
  payload: any;
  status?: number;
  isJson?: boolean;
};

export const handleResponse = (
  expressResponse: Response,
  ioResponse: IOResponse
) => {
  const res = expressResponse.status(ioResponse.status || 200);
  if (ioResponse.isJson === true) {
    res.json(ioResponse.payload);
    return;
  }
  res.send(ioResponse.payload);
};

export class ResponseHandler {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  private addHandlerInternal = (
    method: SupportedMethod,
    path: IOApiPath,
    handler: (req: Request) => IOResponse
  ): ResponseHandler => {
    switch (method) {
      case "get":
        this.app.get(basePath + path, (req, res) =>
          handleResponse(res, handler(req))
        );
        break;
      case "post":
        this.app.post(basePath + path, (req, res) =>
          handleResponse(res, handler(req))
        );
        break;
      case "put":
        throw Error("put not implemented");
      case "update":
        throw Error("update method not implemented");
      default:
        throw Error(`${method} not implemented`);
    }
    return this;
  };

  public addCustomHandler = (
    method: SupportedMethod,
    path: IOApiPath,
    handler: (req: Request) => IOResponse
  ): ResponseHandler => {
    this.addHandlerInternal(method, path, handler);
    return this;
  };

  /**
   * Add an handler for the given api path
   * responsePayload will be sent as response to the request
   * It accepts only IOApiPath defined into the swagger specs (see api_beckend_specs value in package.json)
   */
  public addHandler = (
    method: SupportedMethod,
    path: IOApiPath,
    responsePayload: IOResponse
  ): ResponseHandler => {
    this.addHandlerInternal(method, path, () => responsePayload);
    return this;
  };
}
