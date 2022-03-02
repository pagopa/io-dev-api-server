import avvio from "avvio";
import express from "express";
import * as t from "io-ts";

import { sendFile } from "../../utils/file";

import * as m from "./middleware";

// TODO: find a better place for this decoder
export const HttpResponseCode = t.union([
  t.literal(200),
  t.literal(400),
  t.literal(401),
  t.literal(404),
  t.literal(429),
  t.literal(500)
]);

type PluggableServerAPI = {
  handleRoute: ReturnType<typeof m.makeHandleRoute>;
  useExpressInstance: ReturnType<typeof m.makeUseExpressApplication>;
  sendFile: typeof sendFile;
  getRandomValue: <T>(
    defaultValue: T,
    randomValue: T,
    // tslint:disable-next-line:bool-param-default
    allowRandomValue?: boolean
  ) => T;
} & avvio.Server<PluggableServerAPI>;

export type Server = PluggableServerAPI & {
  listen: (port: number, hostname: string) => Promise<void>;
  toExpressInstance: () => Promise<express.Express>;
  setAllowRandomValues: (b: boolean) => void;
};

export type Plugin<O = {}> = avvio.Plugin<O, PluggableServerAPI>;

export const createServer = (): Server => {
  const ms: m.Middleware[] = [];
  let allowRandomValues = false;

  const api = {
    handleRoute: m.makeHandleRoute(ms),
    useExpressInstance: m.makeUseExpressApplication(ms),
    sendFile,
    getRandomValue: <T>(
      defaultValue: T,
      randomValue: T = defaultValue,
      allowRandomValue = allowRandomValues
    ) => (allowRandomValue ? randomValue : defaultValue)
  };

  avvio(api, {
    autostart: false
  });

  const server = api as PluggableServerAPI;

  const toExpressInstance = async () => {
    await server.ready();
    return m.toExpressInstance(ms);
  };

  const listen = async (port: number, hostname: string) => {
    const app = await toExpressInstance();
    return new Promise<void>(resolve => {
      app.listen(port, hostname, () => {
        resolve(void 0);
      });
    });
  };

  const setAllowRandomValues = (b: boolean) => {
    allowRandomValues = b;
  };

  return {
    ...server,
    toExpressInstance,
    listen,
    setAllowRandomValues
  };
};
