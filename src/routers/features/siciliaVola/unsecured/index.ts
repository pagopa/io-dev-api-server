import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { CategoriaBeneficiarioBean } from "../../../../../generated/definitions/siciliaVola/CategoriaBeneficiarioBean";
import { ComuneBean } from "../../../../../generated/definitions/siciliaVola/ComuneBean";
import { ProvinciaBean } from "../../../../../generated/definitions/siciliaVola/ProvinciaBean";
import { assetsFolder } from "../../../../config";
import { Plugin } from "../../../../core/server";

import { readFileAsJSON } from "../../../../utils/file";
import { addApiV1Prefix } from "../../../../utils/strings";

const addPrefix = (path: string) =>
  addApiV1Prefix(`/mitvoucher/data/rest/unsecured${path}`);

export const SiciliaVolaUnsecuredPlugin: Plugin = async ({ handleRoute }) => {
  /**
   * Get the states list
   */
  handleRoute("get", addPrefix("/statiUE"), (_, res) =>
    res.json(readFileAsJSON(assetsFolder + "/siciliaVola/states.json"))
  );

  /**
   * Get the region list
   */
  handleRoute("get", addPrefix("/regioni"), (_, res) =>
    res.json(readFileAsJSON(assetsFolder + "/siciliaVola/regions.json"))
  );

  /**
   * Get the province list given a RegionID
   */
  handleRoute("get", addPrefix("/province/:region_id"), (req, res) => {
    const maybeRegionId = t.number.decode(Number(req.params.region_id));

    if (E.isLeft(maybeRegionId)) {
      res.sendStatus(500);
      return;
    }

    const maybeRegions = t
      .readonlyArray(ProvinciaBean)
      .decode(readFileAsJSON(assetsFolder + "/siciliaVola/regions.json"));

    if (E.isLeft(maybeRegions)) {
      res.sendStatus(500);
      return;
    }

    const regions = maybeRegions.value.map((r: ProvinciaBean) => r.idRegione);
    const regionIdAccepted = regions.includes(maybeRegionId.value);

    if (regionIdAccepted) {
      const maybeProvinces = t
        .readonlyArray(ProvinciaBean)
        .decode(readFileAsJSON(assetsFolder + "/siciliaVola/provinces.json"));

      if (E.isLeft(maybeProvinces)) {
        res.sendStatus(500);
        return;
      }

      res.json(readFileAsJSON(assetsFolder + "/siciliaVola/provinces.json"));
    } else {
      res.sendStatus(404);
    }
  });

  /**
   * Get the municipality list given a siglaProvincia
   */
  handleRoute("get", addPrefix("/comuni/:sigla_provincia"), (req, res) => {
    const maybeSiglaProvincia = t.string.decode(req.params.sigla_provincia);
    const maybeMunicipalities = t
      .readonlyArray(ComuneBean)
      .decode(
        readFileAsJSON(assetsFolder + "/siciliaVola/municipalities.json")
      );

    if (E.isLeft(maybeMunicipalities) || E.isLeft(maybeSiglaProvincia)) {
      res.sendStatus(500);
      return;
    }

    res.json(readFileAsJSON(assetsFolder + "/siciliaVola/municipalities.json"));
  });

  /**
   * Get the list of the beneficiary categories
   */
  handleRoute("get", addPrefix("/categorieBeneficiario"), (_, res) => {
    const maybeCategorieBeneficiario = t
      .readonlyArray(CategoriaBeneficiarioBean)
      .decode(
        readFileAsJSON(assetsFolder + "/siciliaVola/beneficiaryCategories.json")
      );
    if (E.isLeft(maybeCategorieBeneficiario)) {
      res.sendStatus(500);
      return;
    }
    res.json(
      readFileAsJSON(assetsFolder + "/siciliaVola/beneficiaryCategories.json")
    );
  });
};
