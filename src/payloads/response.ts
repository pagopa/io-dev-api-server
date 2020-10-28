import chalk from "chalk";
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

type Route = { path: string; method: SupportedMethod; description?: string };
// tslint:disable-next-line: no-let
export let routes: ReadonlyArray<Route> = [];
const addNewRoute = (
  method: SupportedMethod,
  path: string,
  description?: string
) => {
  routes = [...routes, { path, method, description }];
};

export const allRegisteredRoutes = (joiner: string = "\n") =>
  [...routes]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(
      r =>
        `[${r.method}]\t${r.path} ${fromNullable(r.description)
          // tslint:disable-next-line:no-nested-template-literals
          .map(d => `(${d})`)
          .getOrElse("")}`
    )
    .join(joiner);

type HandlerOptions<T> = {
  codec?: t.Type<T>;
  delay?: Millisecond;
  description?: string;
};

export const installHandler = <T>(
  router: Router,
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request) => IOResponse<T>,
  options?: HandlerOptions<T>
) => {
  addNewRoute(method, path, options?.description);
  router[method](path, (req, res) => {
    const responsePayload = handleRequest(req);
    const validation = fromNullable(options)
      .chain(o => fromNullable(o.codec))
      .map(c => c.decode(responsePayload.payload));
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
    const delay = options?.delay ?? 0;
    if (delay > 0) {
      console.log(
        chalk.red(`${path} response has a delayed of ${delay} milliseconds`)
      );
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
  handleRequest: (request: Request, response: Response) => void,
  description?: string
) => {
  addNewRoute(method, path, description);
  router[method](path, (req, res) => {
    handleRequest(req, res);
  });
};
