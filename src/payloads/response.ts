import chalk from "chalk";
import { Request, Response, Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";

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
  description?: string;
};

export const addHandler = <T>(
  router: Router,
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void,
  delay?: number,
  options?: HandlerOptions<T>
) => {
  addNewRoute(method, path, options?.description);
  router[method](path, (req, res) => {
    setTimeout(() => {
      if ((delay ?? 0) > 0) {
        console.log(
          chalk.red(`${path} response has a delayed of ${delay} milliseconds`)
        );
      }
      handleRequest(req, res);
    }, delay ?? 0);
  });
};
