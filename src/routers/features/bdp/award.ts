// return the T&C as a HTML string
import { Router } from "express";
import fs from "fs";
import { BpdAwardPeriods } from "../../../../generated/definitions/bpd/award/BpdAwardPeriods";
import { assetsFolder } from "../../../global";
import {
  installCustomHandler,
  installHandler
} from "../../../payloads/response";
import { listDir } from "../../../utils/file";
import { toPayload } from "../../../utils/validator";
import { addBPDPrefix } from "./index";

export const bpdAward = Router();
const readPeriodPreset = (fileName: string) =>
  JSON.parse(
    fs.readFileSync(assetsFolder + "/bpd/award/periods/" + fileName).toString()
  );
// tslint:disable-next-line: no-let
let awardPeriods: BpdAwardPeriods = BpdAwardPeriods.decode(
  readPeriodPreset("default.json")
).getOrElse([]);

// return the json file names to populate the dashboard UI
installCustomHandler(
  bpdAward,
  "get",
  addBPDPrefix("/award/periods/presets"),
  (_, res) => {
    const files = listDir(assetsFolder + "/bpd/award/periods");
    res.json(files);
  }
);

// update the period preset
installCustomHandler(
  bpdAward,
  "post",
  addBPDPrefix("/award/periods/presets/:period"),
  (req, res) => {
    const files = listDir(assetsFolder + "/bpd/award/periods");
    const file = files.find(f => f === req.params.period);
    if (file) {
      awardPeriods = BpdAwardPeriods.decode(readPeriodPreset(file)).getOrElse(
        []
      );
    }
    res.sendStatus(200);
  }
);

installHandler(bpdAward, "get", addBPDPrefix("/io/award-periods"), () =>
  toPayload(awardPeriods)
);
