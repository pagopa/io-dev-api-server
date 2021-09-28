// return the list of ranking info for each BPD period
import { Router } from "express";
import { assetsFolder } from "../../../../config";
import { addHandler } from "../../../../payloads/response";
import { listDir, readFileAsJSON } from "../../../../utils/file";
import { addBPDPrefix } from "../index";

// tslint:disable-next-line: no-let
let rankingJsonFile: string = "default.json";
export const bpdRankingV2 = Router();
addHandler(
  bpdRankingV2,
  "get",
  addBPDPrefix("/io/citizen/v2/ranking"),
  (req, res) => {
    res.json(
      readFileAsJSON(assetsFolder + "/bpd/ranking/v2/" + rankingJsonFile)
    );
  }
);

// get the available presets (dashboard web)
addHandler(
  bpdRankingV2,
  "get",
  addBPDPrefix("/ranking/preset/v2"),
  (_, res) => {
    const rankingFiles = listDir(assetsFolder + "/bpd/ranking/v2");
    res.json(rankingFiles);
  }
);

// update the current ranking preset (dashboard web)
addHandler(
  bpdRankingV2,
  "post",
  addBPDPrefix("/ranking/presets/v2/:file"),
  (req, res) => {
    rankingJsonFile = req.params.file;
    res.sendStatus(200);
  }
);
