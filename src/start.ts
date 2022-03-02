import _ from "lodash";
import fs from "node:fs/promises";
import {
  createIODevelopmentServer,
  defaultIODevelopmentOptions,
  IODevelopmentServerOptions
} from "./server";

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
  await server.listen(3000, "localhost");
  console.log("listening to 3000...");
};

start();
