import chalk from "chalk";
import { Request, Response, Router } from "express";

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
export const addNewRoute = (
  method: SupportedMethod,
  path: string,
  description?: string
) => {
  routes = [...routes, { path, method, description }];
};

type HandlerOptions = {
  description?: string;
};

export const addHandler = (
  router: Router,
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void,
  delay?: number,
  options?: HandlerOptions
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
