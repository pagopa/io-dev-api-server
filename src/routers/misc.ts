import { Plugin } from "../core/server";
import { IoDevServerConfig } from "../types/config";

export type MiscPluginOptions = {
  IODevServerConfig: IoDevServerConfig;
};

export const MiscPlugin: Plugin<MiscPluginOptions> = async (
  { handleRoute, sendFile },
  options
) => {
  handleRoute("get", "/myportal_playground.html", (_, res) => {
    sendFile("assets/html/myportal_playground.html", res);
  });

  /**
   * API dedicated to dev- server
   * return the current dev-server configuration
   */
  handleRoute("get", "/config", (_, res) => {
    res.json(options.IODevServerConfig);
  });
};
