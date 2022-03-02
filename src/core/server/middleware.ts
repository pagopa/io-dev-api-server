import chalk from "chalk";
import express from "express";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export type Route = {
  method: HttpMethod;
  path: string;
  handler: express.Handler;
  delay: number;
  description: string;
};

export type ExpressInstanceHook = (app: express.Express) => Promise<void>;

export type Middleware =
  | (Route & { _tag: "Route" })
  | { hook: ExpressInstanceHook; _tag: "ExpressInstanceHook" };

export const makeHandleRoute = (ms: Middleware[]) => (
  method: HttpMethod,
  path: string,
  handler: express.Handler,
  delay: number = 0,
  description: string = ""
) => {
  let h = handler;
  if (delay > 0) {
    h = (req, res, next) => {
      setTimeout(() => {
        handler(req, res, next);
        console.log(
          chalk.red(`${path} response has a delayed of ${delay} milliseconds`)
        );
      }, delay);
    };
  }
  ms.push({
    _tag: "Route",
    method,
    path,
    handler: h,
    delay,
    description
  });
};

export const makeUseExpressApplication = (ms: Middleware[]) => (
  hook: ExpressInstanceHook
) => {
  ms.push({
    _tag: "ExpressInstanceHook",
    hook
  });
};

export const toExpressInstance = (ms: Middleware[]): express.Express => {
  const app = express();
  ms.forEach(async m => {
    switch (m._tag) {
      case "Route":
        app[m.method](m.path, m.handler);
        break;
      case "ExpressInstanceHook":
        await m.hook(app);
        break;
    }
  });
  return app;
};
