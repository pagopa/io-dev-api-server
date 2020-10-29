// return the T&C as a HTML string
import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import fs from "fs";
import { BpdAwardPeriods } from "../../../../generated/definitions/bpd/award/BpdAwardPeriods";
import { TotalCashbackResource } from "../../../../generated/definitions/bpd/winning_transactions/TotalCashbackResource";
import { assetsFolder } from "../../../global";
import {
  installCustomHandler,
  installHandler
} from "../../../payloads/response";
import { listDir } from "../../../utils/file";
import { toPayload } from "../../../utils/validator";
import { addBPDPrefix } from "./index";

export const bpdAward = Router();
const readPeriodPresetJson = (fileName: string) =>
  JSON.parse(
    fs.readFileSync(assetsFolder + "/bpd/award/periods/" + fileName).toString()
  );

const readTotalCashbackJson = (directoryName: string, fileName: string) =>
  JSON.parse(
    fs
      .readFileSync(
        `${assetsFolder}/bpd/award/total_cashback/${directoryName}/${fileName}`
      )
      .toString()
  );

// tslint:disable-next-line: no-let
let awardPeriods: BpdAwardPeriods = BpdAwardPeriods.decode(
  readPeriodPresetJson("default.json")
).getOrElse([]);

// return the list of json file names to populate the web dashboard
installCustomHandler(
  bpdAward,
  "get",
  addBPDPrefix("/award/periods/presets"),
  (_, res) => {
    const files = listDir(assetsFolder + "/bpd/award/periods");
    res.json(files);
  }
);

// update the period preset (web dashboard)
installCustomHandler(
  bpdAward,
  "post",
  addBPDPrefix("/award/periods/presets/:period"),
  (req, res) => {
    const files = listDir(assetsFolder + "/bpd/award/periods");
    const file = files.find(f => f === req.params.period);
    if (file) {
      awardPeriods = BpdAwardPeriods.decode(
        readPeriodPresetJson(file)
      ).getOrElse([]);
    }
    res.sendStatus(200);
  }
);

// response with the bpd award periods
installHandler(bpdAward, "get", addBPDPrefix("/io/award-periods"), () =>
  toPayload(awardPeriods)
);

// tslint:disable-next-line: no-let
let totalCashback: Map<number, string> = new Map<number, string>([
  [0, "default.json"]
]);

// response with the total cashback
installCustomHandler(
  bpdAward,
  "get",
  addBPDPrefix("/io/winning-transactions/total-cashback"),
  (req, res) => {
    const awardPeriodId = parseInt(req.query.awardPeriodId, 10);
    fromNullable(totalCashback.get(awardPeriodId)).foldL(
      () => res.sendStatus(404),
      p =>
        res.json(
          TotalCashbackResource.decode(
            readTotalCashbackJson(req.query.awardPeriodId, p)
          ).value as TotalCashbackResource
        )
    );
  }
);

installCustomHandler(
  bpdAward,
  "get",
  addBPDPrefix("/winning-transactions/presets"),
  (_, res) => {
    const folders = listDir(assetsFolder + "/bpd/award/total_cashback");
    const folderFiles = folders.reduce((acc, curr) => {
      const files = listDir(`${assetsFolder}/bpd/award/total_cashback/${curr}`);
      return { ...acc, [curr]: files };
    }, {});
    res.json(folderFiles);
  }
);

installCustomHandler(
  bpdAward,
  "post",
  addBPDPrefix("/winning-transactions/presets"),
  (req, res) => {
    const payload = req.body;
    console.log(payload);
    totalCashback.set(parseInt(payload.directory, 10), payload.file);
    res.sendStatus(200);
  }
);
