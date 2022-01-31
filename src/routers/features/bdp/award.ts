// return the T&C as a HTML string
import chalk from "chalk";
import * as E from "fp-ts/lib/Either";
import { BpdAwardPeriods } from "../../../../generated/definitions/bpd/award/BpdAwardPeriods";
import { assetsFolder } from "../../../config";
import { Plugin } from "../../../core/server";
import { listDir, readFileAsJSON } from "../../../utils/file";
import { addBPDPrefix } from "./index";

const readPeriodPresetJson = (fileName: string) =>
  readFileAsJSON(assetsFolder + "/bpd/award/periods/" + fileName);

// tslint:disable-next-line: no-let
let awardPeriods: string = "default.json";

export const BPDAwardPlugin: Plugin = async ({ handleRoute }) => {
  // return the list of json file names to populate the web dashboard
  handleRoute("get", addBPDPrefix("/award/periods/presets"), (_, res) => {
    const files = listDir(assetsFolder + "/bpd/award/periods");
    res.json(files);
  });

  // update the period preset (web dashboard)
  handleRoute(
    "post",
    addBPDPrefix("/award/periods/presets/:period"),
    (req, res) => {
      const files = listDir(assetsFolder + "/bpd/award/periods");
      const file = files.find(f => f === req.params.period);
      if (file) {
        const maybeAwardPeriods = BpdAwardPeriods.decode(
          readPeriodPresetJson(file)
        );
        if (E.isLeft(maybeAwardPeriods)) {
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
  handleRoute("get", addBPDPrefix("/io/award-periods"), (_, res) =>
    res.json(readPeriodPresetJson(awardPeriods))
  );
};
