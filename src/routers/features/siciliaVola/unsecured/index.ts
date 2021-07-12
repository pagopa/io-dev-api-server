import { Router } from "express";
import { assetsFolder } from "../../../../global";
import { addHandler } from "../../../../payloads/response";
import { readFileAsJSON } from "../../../../utils/file";
import { addApiV1Prefix } from "../../../../utils/strings";

export const unsecuredSvRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/sv/rest/unsecured${path}`);

/**
 * Get the states list
 */
addHandler(unsecuredSvRouter, "get", addPrefix("/statiUE"), (_, res) =>
  res.json(readFileAsJSON(assetsFolder + "/siciliaVola/states.json"))
);

/**
 * Get the region list
 */
addHandler(unsecuredSvRouter, "get", addPrefix("/regioni"), (_, res) =>
  res.json(readFileAsJSON(assetsFolder + "/siciliaVola/regions.json"))
);
