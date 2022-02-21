import Avvio from "avvio";
import express from "express";

import bodyParser from "body-parser";
import morgan from "morgan";

import { sendFile } from "../utils/file";

import chalk from "chalk";

import * as t from "io-ts";
import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";
import { errorMiddleware } from "../middleware/errorMiddleware";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export const HttpResponseCode = t.union([
  t.literal(200),
  t.literal(400),
  t.literal(401),
  t.literal(404),
  t.literal(429),
  t.literal(500)
]);

export type HttpResponseCode = t.TypeOf<typeof HttpResponseCode>;

type Route = {
  method: HttpMethod;
  path: string;
  handler: express.Handler;
  delay: number;
  description: string;
};

type ServerInfo = {
  routes: Array<Route>;
};

export type Server = {
  handleRoute: (
    method: HttpMethod,
    path: string,
    handler: express.Handler,
    delay?: number,
    description?: string
  ) => void;
  listen: (port: number, hostname: string) => Promise<ServerInfo>;
  routes: () => Array<Route>;
  sendFile: typeof sendFile;
  toExpressApplication: () => Promise<express.Application>;
};

type WithAvvio<T> = T & Avvio.Server<T>;

export type Plugin<O = {}> = Avvio.Plugin<O, Server>;



const ErrorCodes = WithinRangeNumber(400, 600);
type ErrorCodes = t.TypeOf<typeof ErrorCodes>;

const responseError = t.interface({
  // the probability that server will response with an error
  chance: WithinRangeNumber(0, 1),
  // a bucket of error codes. If the server will response with an error, a random one will be picked
  codes: t.readonlyArray(ErrorCodes)
});

export type ResponseError = t.TypeOf<typeof responseError>;

type ServerOptions = {
  logger: boolean;
  responseError?: ResponseError
};

const defaultOptions: ServerOptions = {
  logger: false,
};

const makeHandleRoute = (routes: Array<Route>) => (
  method: HttpMethod,
  path: string,
  handler: express.Handler,
  delay = 0,
  description = ""
) => {
  if (delay > 0) {
    routes.push({
      method,
      path,
      handler: (req, res, next) => {
        setTimeout(() => {
          handler(req, res, next);
          console.log(
            chalk.red(`${path} response has a delayed of ${delay} milliseconds`)
          );
        }, delay);
      },
      delay: 0,
      description: `delayer (${delay} ms)`
    });
  }
  routes.push({
    method,
    path,
    handler,
    delay,
    description
  });
};

export const createServer = (options = defaultOptions): WithAvvio<Server> => {
  const routes = new Array<Route>();

  const s: Server = {
    handleRoute: makeHandleRoute(routes),
    sendFile,
    routes: () => routes,
    listen,
    toExpressApplication
  };

  const avvio = Avvio(s, {
    autostart: false
  });

  async function listen(port: number, hostname: string) {
    const app = await toExpressApplication();
    return new Promise<ServerInfo>(resolve => {
      app.listen(port, hostname, () => {
        resolve({
          routes: s.routes()
        });
      });
    });
  }

  async function toExpressApplication() {
    const ctx = await avvio.ready();
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    if (options.logger) {
      app.use(
        morgan(
          ":date[iso] :method :url :status :res[content-length] - :response-time ms"
        )
      );
    }
    if (options.responseError) {
      app.use(errorMiddleware(options.responseError))
    }
    ctx.routes().forEach(route => {
      app[route.method](route.path, route.handler);
    });
    return app;
  }

  return s as WithAvvio<Server>;
};
