// return the list of ranking info for each BPD period

import { assetsFolder } from "../../../../config";
import { Plugin } from "../../../../core/server";
import { listDir, readFileAsJSON } from "../../../../utils/file";
import { addBPDPrefix } from "../index";

// tslint:disable-next-line: no-let
let rankingJsonFile: string = "default.json";

export const BPDRankingV1Plugin: Plugin = async ({ handleRoute }) => {
  handleRoute("get", addBPDPrefix("/io/citizen/ranking"), (req, res) => {
    res.json(readFileAsJSON(assetsFolder + "/bpd/ranking/" + rankingJsonFile));
  });

  // get the available presets (dashboard web)
  handleRoute("get", addBPDPrefix("/ranking/presets"), (_, res) => {
    const rankingFiles = listDir(assetsFolder + "/bpd/ranking");
    res.json(rankingFiles);
  });

  // update the current ranking preset (dashboard web)
  handleRoute("post", addBPDPrefix("/ranking/presets/:file"), (req, res) => {
    rankingJsonFile = req.params.file;
    res.sendStatus(200);
  });
};
