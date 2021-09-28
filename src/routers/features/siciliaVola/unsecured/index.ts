import { Router } from "express";
import * as t from "io-ts";
import { CategoriaBeneficiarioBean } from "../../../../../generated/definitions/siciliaVola/CategoriaBeneficiarioBean";
import { ComuneBean } from "../../../../../generated/definitions/siciliaVola/ComuneBean";
import { ProvinciaBean } from "../../../../../generated/definitions/siciliaVola/ProvinciaBean";
import { assetsFolder } from "../../../../config";
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
    const maybeRegionId = t.number.decode(Number(req.params.region_id));

    if (maybeRegionId.isLeft()) {
      res.sendStatus(500);
      return;
    }

    const maybeRegions = t
      .readonlyArray(ProvinciaBean)
      .decode(readFileAsJSON(assetsFolder + "/siciliaVola/regions.json"));

    if (maybeRegions.isLeft()) {
      res.sendStatus(500);
      return;
    }

    const regions = maybeRegions.value.map((r: ProvinciaBean) => r.idRegione);
    const regionIdAccepted = regions.includes(maybeRegionId.value);

    if (regionIdAccepted) {
      const maybeProvinces = t
        .readonlyArray(ProvinciaBean)
        .decode(readFileAsJSON(assetsFolder + "/siciliaVola/provinces.json"));

      if (maybeProvinces.isLeft()) {
        res.sendStatus(500);
        return;
      }

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
  (req, res) => {
    const maybeSiglaProvincia = t.string.decode(req.params.sigla_provincia);
    const maybeMunicipalities = t
      .readonlyArray(ComuneBean)
      .decode(
        readFileAsJSON(assetsFolder + "/siciliaVola/municipalities.json")
      );

    if (maybeMunicipalities.isLeft() || maybeSiglaProvincia.isLeft()) {
      res.sendStatus(500);
      return;
    }

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
    const maybeCategorieBeneficiario = t
      .readonlyArray(CategoriaBeneficiarioBean)
      .decode(
        readFileAsJSON(assetsFolder + "/siciliaVola/beneficiaryCategories.json")
      );
    if (maybeCategorieBeneficiario.isLeft()) {
      res.sendStatus(500);
      return;
    }
    res.json(
      readFileAsJSON(assetsFolder + "/siciliaVola/beneficiaryCategories.json")
    );
  }
);
