import Avvio from "avvio";
import express from "express";

import bodyParser from "body-parser";
import morgan from "morgan";

import { sendFile } from "../utils/file";

import chalk from "chalk";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

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

type ListenCallback = (info: ServerInfo) => void;

export type Server = {
  handleRoute: (
    method: HttpMethod,
    path: string,
    handler: express.Handler,
    delay?: number,
    description?: string
  ) => void;
  listen: (port: number, hostname: string, cb: ListenCallback) => void;
  routes: () => Array<Route>;
  sendFile: typeof sendFile;
};

type WithAvvio<T> = T & Avvio.Server<T>;

export type Plugin<O = {}> = Avvio.Plugin<O, Server>;

type ServerOptions = {
  logger: boolean;
};

const defaultOptions: ServerOptions = {
  logger: false
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
    listen
  };

  const avvio = Avvio(s, {
    autostart: false
  });

  function listen(port: number, hostname: string, cb: ListenCallback) {
    avvio.ready().then(ctx => {
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
      ctx.routes().forEach(route => {
        app[route.method](route.path, route.handler);
      });
      app.listen(port, hostname, () => {
        cb({
          routes: [...ctx.routes()]
        });
      });
    });
  }

  return s as WithAvvio<Server>;
};
