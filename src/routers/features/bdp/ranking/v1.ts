// return the list of ranking info for each BPD period
import { Router } from "express";
import { assetsFolder } from "../../../../config";
import { addHandler } from "../../../../payloads/response";
import { listDir, readFileAsJSON } from "../../../../utils/file";
import { addBPDPrefix } from "../index";

// eslint-disable-next-line: no-let
let rankingJsonFile: string = "default.json";
export const bpdRanking = Router();
addHandler(
  bpdRanking,
  "get",
  addBPDPrefix("/io/citizen/ranking"),
  (req, res) => {
    res.json(readFileAsJSON(assetsFolder + "/bpd/ranking/" + rankingJsonFile));
  }
);

// get the available presets (dashboard web)
addHandler(bpdRanking, "get", addBPDPrefix("/ranking/presets"), (_, res) => {
  const rankingFiles = listDir(assetsFolder + "/bpd/ranking");
  res.json(rankingFiles);
});

// update the current ranking preset (dashboard web)
addHandler(
  bpdRanking,
  "post",
  addBPDPrefix("/ranking/presets/:file"),
  (req, res) => {
    rankingJsonFile = req.params.file;
    res.sendStatus(200);
  }
);
