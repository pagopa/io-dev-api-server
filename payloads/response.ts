import { Request, Response, Application } from "express";
import {
  IOApiPath,
  SupportedMethod,
  basePath
} from "../generated/definitions/server_paths";

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

export const handleSimpleResponse = (
  expressRequest: Request,
  expressResponse: Response,
  ioResponse: IOResponse
) => {
  handleResponse(expressResponse, ioResponse);
};

export class ResponseHandler {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  private _addHandler = (
    method: SupportedMethod,
    path: IOApiPath,
    handler: (req: Request) => IOResponse
  ): ResponseHandler => {
    switch (method) {
      case "get":
        this.app.get(basePath + path, (req, res) =>
          handleSimpleResponse(req, res, handler(req))
        );
        break;
      case "post":
        break;
      case "put":
        break;
      case "update":
        break;
    }
    return this;
  };

  public addCustomHandler = (
    method: SupportedMethod,
    path: IOApiPath,
    handler: (req: Request) => IOResponse
  ): ResponseHandler => {
    this._addHandler(method, path, handler);
    return this;
  };

  /**
   * add an handler to the given path
   * responsePayload will be sent as response to the request
   */
  public addHandler = (
    method: SupportedMethod,
    path: IOApiPath,
    responsePayload: IOResponse
  ): ResponseHandler => {
    this._addHandler(method, path, () => responsePayload);
    return this;
  };
}
