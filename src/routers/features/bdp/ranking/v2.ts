// return the list of ranking info for each BPD period

import { assetsFolder } from "../../../../config";
import { Plugin } from "../../../../core/server";
import { listDir, readFileAsJSON } from "../../../../utils/file";
import { addBPDPrefix } from "../index";

// tslint:disable-next-line: no-let
let rankingJsonFile: string = "default.json";

export const BPDRankingV2Plugin: Plugin = async ({ handleRoute }) => {
  handleRoute("get", addBPDPrefix("/io/citizen/v2/ranking"), (req, res) => {
    res.json(
      readFileAsJSON(assetsFolder + "/bpd/ranking/v2/" + rankingJsonFile)
    );
  });

  // get the available presets (dashboard web)
  handleRoute("get", addBPDPrefix("/ranking/preset/v2"), (_, res) => {
    const rankingFiles = listDir(assetsFolder + "/bpd/ranking/v2");
    res.json(rankingFiles);
  });
  // update the current ranking preset (dashboard web)
  handleRoute("post", addBPDPrefix("/ranking/presets/v2/:file"), (req, res) => {
    rankingJsonFile = req.params.file;
    res.sendStatus(200);
  });
};
