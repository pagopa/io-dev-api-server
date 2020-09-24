import { Request, Response, Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { Millisecond } from "italia-ts-commons/lib/units";
import { getProblemJson } from "./error";

export const basePath = "/api/v1";
export type SupportedMethod = "get" | "post" | "put" | "delete" | "patch";

export type IOResponse<T> = {
  payload: T;
  status?: number;
  isJson?: boolean;
};

type Route = { path: string; method: SupportedMethod };
// tslint:disable-next-line: no-let
export let routes: ReadonlyArray<Route> = [];
const addNewRoute = (method: SupportedMethod, path: string) => {
  routes = [...routes, { path, method }];
};

export const allRegisteredRoutes = (joiner: string = "\n") =>
  [...routes]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(r => `[${r.method}]\t${r.path}`)
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
    const validation = fromNullable(codec).map(c =>
      c.decode(responsePayload.payload)
    );
    // the provided payload is not respecting the codec shape
    if (validation.isSome() && validation.value.isLeft()) {
      const problem = getProblemJson(
        500,
        "the returned payload is not compliant with the target codec",
        PathReporter.report(validation.value).toString()
      );
      console.error(problem);
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
