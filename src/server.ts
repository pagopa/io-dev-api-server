import express, { Router } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import * as O from "fp-ts/lib/Option";

import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { delayer } from "./utils/delay_middleware";

type CreateMockServerOptions = {
  delay: O.Option<Millisecond>;
  logger: boolean;
  routers: ReadonlyArray<Router>;
}

export const defaultMockServerOptions: CreateMockServerOptions = {
  delay: O.none,
  logger: false,
  routers: []
}

export const createMockServer = (options = defaultMockServerOptions) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  const delay = options.delay.fold(0 as Millisecond, ms => ms)
  app.use(delayer(delay));
  if (options.logger) {
    app.use(morgan(":date[iso] :method :url :status :res[content-length] - :response-time ms"));
  }
  options.routers.forEach(r => app.use(r));
  return app;
};