import { Application, Request, Response, Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { Millisecond } from "italia-ts-commons/lib/units";
import {
  basePath,
  SupportedMethod,
} from "../../generated/definitions/backend_api_paths";
import { getProblemJson } from "./error";
import { PathReporter } from "io-ts/lib/PathReporter";

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
    path: string,
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
    path: string,
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
    path: string,
    responsePayload: IOResponse<T>,
    delay: Millisecond = 0 as Millisecond
  ): ResponseHandler => {
    this.registerHandler(method, path, () => responsePayload, delay);
    return this;
  };
}

type Route = { path: string; method: SupportedMethod };
const routes: Route[] = [];
const addNewRoute = (method: SupportedMethod, path: string) => {
  routes.push({ path, method });
};

export const allRegisteredRoutes = (joiner: string = "\n") =>
  routes
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((r) => `[${r.method}]\t${r.path}`)
    .join(joiner);

export const installHandler = <T>(
  router: Router,
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request) => IOResponse<T>,
  codec?: t.Type<T>,
  delay: Millisecond = 0 as Millisecond
) => {
  addNewRoute(method, path);
  router[method](path, (req, res) => {
    const responsePayload = handleRequest(req);
    const validation = fromNullable(codec).map((c) =>
      c.decode(responsePayload.payload)
    );
    // the provided payload is not respecting the codec shape
    if (validation.isSome() && validation.value.isLeft()) {
      const problem = getProblemJson(
        500,
        "the returned payload is not compliant with the target codec",
        PathReporter.report(validation.value).toString()
      );
      res.status(problem.status || 500).json(problem.payload);
      return;
    }
    const status = responsePayload.status || 200;
    const executeRes = () =>
      responsePayload.isJson
        ? res.status(status).json(responsePayload.payload)
        : res.status(status).send(responsePayload.payload);
    if (delay > 0) {
      setTimeout(executeRes, delay);
      return;
    }
    executeRes();
  });
};

export const installCustomHandler = <T>(
  router: Router,
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => {
  addNewRoute(method, path);
  router[method](path, (req, res) => {
    handleRequest(req, res);
  });
};
