// return the T&C as a HTML string
import chalk from "chalk";
import { Router } from "express";
import { BpdAwardPeriods } from "../../../../generated/definitions/bpd/award/BpdAwardPeriods";
import { assetsFolder } from "../../../global";
import { addHandler } from "../../../payloads/response";
import { listDir, readFileAsJSON } from "../../../utils/file";
import { addBPDPrefix } from "./index";

export const bpdAward = Router();
const readPeriodPresetJson = (fileName: string) =>
  readFileAsJSON(assetsFolder + "/bpd/award/periods/" + fileName);



// tslint:disable-next-line: no-let
let awardPeriods: string = "default.json";

// return the list of json file names to populate the web dashboard
addHandler(
  bpdAward,
  "get",
  addBPDPrefix("/award/periods/presets"),
  (_, res) => {
    const files = listDir(assetsFolder + "/bpd/award/periods");
    res.json(files);
  }
);

// update the period preset (web dashboard)
addHandler(
  bpdAward,
  "post",
  addBPDPrefix("/award/periods/presets/:period"),
  (req, res) => {
    const files = listDir(assetsFolder + "/bpd/award/periods");
    const file = files.find(f => f === req.params.period);
    if (file) {
      const maybeAwardPeriods = BpdAwardPeriods.decode(
        readPeriodPresetJson(file)
      );
      if (maybeAwardPeriods.isLeft()) {
        console.log(chalk.red(`${file} is not a valid BpdAwardPeriods`));
        res.sendStatus(500);
      } else {
        awardPeriods = file;
        res.sendStatus(200);
      }
    }
  }
);

// response with the bpd award periods
addHandler(bpdAward, "get", addBPDPrefix("/io/award-periods"), (_, res) =>
  res.json(readPeriodPresetJson(awardPeriods))
);

