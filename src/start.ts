import {
  createIODevelopmentServer,
  defaultIODevelopmentOptions,
  IODevelopmentServerOptions
} from "./server";
import fs from "node:fs/promises";
import _ from "lodash";

const loadConfig = async (path = "./config/config.json") => {
  let config: Partial<IODevelopmentServerOptions> = {};
  try {
    await fs.access(path);
    const file = await fs.readFile(path, "utf-8");
    config = JSON.parse(file);
  } catch (err) {}
  return config;
};

const start = async () => {
  const customConfig = await loadConfig();
  const config = _.merge(customConfig, defaultIODevelopmentOptions);
  const server = createIODevelopmentServer(config);
  const { routes } = await server.listen(3000, "localhost");
  console.log(routes.length);
  console.log("listening to 3000...");
};

start();
