import { Router } from "express";
import { ProvinciaBean } from "../../../../../generated/definitions/siciliaVola/ProvinciaBean";
import { assetsFolder } from "../../../../global";
import { addHandler } from "../../../../payloads/response";
import { readFileAsJSON } from "../../../../utils/file";
import { addApiV1Prefix } from "../../../../utils/strings";

export const unsecuredSvRouter = Router();

const addPrefix = (path: string) =>
  addApiV1Prefix(`/mitvoucher/data/rest/unsecured${path}`);

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

/**
 * Get the province list given a RegionID
 */
addHandler(
  unsecuredSvRouter,
  "get",
  addPrefix("/province/:region_id"),
  (req, res) => {
    const regionId = req.params.region_id;

    const regions = readFileAsJSON(
      assetsFolder + "/siciliaVola/regions.json"
    ).map((r: ProvinciaBean) => r.idRegione);

    const regionIdAccepted = regionId in regions;

    if (regionIdAccepted) {
      res.json(readFileAsJSON(assetsFolder + "/siciliaVola/provinces.json"));
    } else {
      res.sendStatus(404);
    }
  }
);

/**
 * Get the municipality list given a siglaProvincia
 */
addHandler(
  unsecuredSvRouter,
  "get",
  addPrefix("/comuni/:sigla_provincia"),
  (_, res) => {
    res.json(readFileAsJSON(assetsFolder + "/siciliaVola/municipalities.json"));
  }
);

/**
 * Get the list of the beneficiary categories
 */
addHandler(
  unsecuredSvRouter,
  "get",
  addPrefix("/categorieBeneficiario"),
  (_, res) => {
    res.json(
      readFileAsJSON(assetsFolder + "/siciliaVola/beneficiaryCategories.json")
    );
  }
);
