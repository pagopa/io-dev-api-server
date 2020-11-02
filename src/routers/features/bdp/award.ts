// return the T&C as a HTML string
import chalk from "chalk";
import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import fs from "fs";
import { BpdAwardPeriods } from "../../../../generated/definitions/bpd/award/BpdAwardPeriods";
import { BpdWinningTransactions } from "../../../../generated/definitions/bpd/total_cashback/BpdWinningTransactions";
import { TotalCashbackResource } from "../../../../generated/definitions/bpd/total_cashback/TotalCashbackResource";
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

const readWinningTransactions = (directoryName: string, fileName: string) =>
  JSON.parse(
    fs
      .readFileSync(
        `${assetsFolder}/bpd/award/winning_transactions/${directoryName}/${fileName}`
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
      const maybeAwardPeriods = BpdAwardPeriods.decode(
        readPeriodPresetJson(file)
      );
      if (maybeAwardPeriods.isLeft()) {
        console.log(chalk.red(`${file} is not a valid BpdAwardPeriods`));
        res.sendStatus(500);
      } else {
        awardPeriods = maybeAwardPeriods.value;
        res.sendStatus(200);
      }
    }
  }
);

// response with the bpd award periods
installHandler(bpdAward, "get", addBPDPrefix("/io/award-periods"), () =>
  toPayload(awardPeriods)
);

// tslint:disable-next-line: no-let
let totalCashback: Map<number, string>;

const initTotalCashback = () => {
  totalCashback = new Map<number, string>([
    [0, "default.json"],
    [1, "default.json"],
    [2, "default.json"],
    [3, "default.json"],
    [4, "default.json"]
  ]);
};
initTotalCashback();

// get the total cashback from a given awardPeriodId
installCustomHandler(
  bpdAward,
  "get",
  addBPDPrefix("/io/winning-transactions/total-cashback"),
  (req, res) => {
    const awardPeriodId = parseInt(req.query.awardPeriodId, 10);
    fromNullable(totalCashback.get(awardPeriodId)).foldL(
      () => {
        res.sendStatus(404);
      },
      p => {
        const maybeTotalCashBack = TotalCashbackResource.decode(
          readTotalCashbackJson(req.query.awardPeriodId, p)
        );

        if (maybeTotalCashBack.isLeft()) {
          console.log(chalk.red(`${p} is not a valid TotalCashbackResource`));
          res.sendStatus(500);
        } else {
          res.json(maybeTotalCashBack.value);
        }
      }
    );
  }
);

// tslint:disable-next-line: no-let
let winningTransactions: Map<number, Map<string, string>> = new Map<
  number,
  Map<string, string>
>();

const initWinningTransaction = () => {
  winningTransactions = new Map<number, Map<string, string>>([
    [0, new Map<string, string>()],
    [1, new Map<string, string>()],
    [2, new Map<string, string>()],
    [3, new Map<string, string>()],
    [4, new Map<string, string>()]
  ]);
};
initWinningTransaction();

installCustomHandler(
  bpdAward,
  "get",
  addBPDPrefix("/io/winning-transactions"),
  (req, res) => {
    const awardPeriodId = parseInt(req.query.awardPeriodId, 10);
    const hpan = req.query.hpan;
    if (!winningTransactions.has(awardPeriodId)) {
      res.sendStatus(404);
      return;
    }
    const response = (period: number, file: string) => {
      const maybeTransactions = BpdWinningTransactions.decode(
        readWinningTransactions(period.toString(), file)
      );
      if (maybeTransactions.isLeft()) {
        console.log(
          chalk.red(
            `${period.toString()}/${file} is not a valid BpdWinningTransactions`
          )
        );
        res.sendStatus(500);
      } else {
        // inject the hpan
        res.json(maybeTransactions.value.map(t => ({ ...t, hashPan: hpan })));
      }
    };
    // if hashpan is not mapped, return 404 -> not found
    if (!winningTransactions.get(awardPeriodId)!.has(hpan)) {
      res.sendStatus(404);
      return;
    }
    const hashFile = winningTransactions.get(awardPeriodId)!.get(hpan)!;
    response(awardPeriodId, hashFile);
  }
);

// update the configuration for winning transactions (web dashboard)
installCustomHandler(
  bpdAward,
  "post",
  addBPDPrefix("/winning-transactions/transactions/presets"),
  (req, res) => {
    const payload = req.body;
    // check if the json is valid
    const maybeTransactions = BpdWinningTransactions.decode(
      readWinningTransactions(payload.period, payload.file)
    );
    if (maybeTransactions.isLeft()) {
      console.log(
        chalk.red(`${payload.file} is not a valid BpdWinningTransactions`)
      );
      res.sendStatus(500);
    } else {
      winningTransactions.get(parseInt(payload.period, 10))!.clear();
      winningTransactions
        .get(parseInt(payload.period, 10))!
        .set(payload.hpan, payload.file);
      res.sendStatus(200);
    }
  }
);

// return the configuration for winning-transactions (web dashboard)
installCustomHandler(
  bpdAward,
  "get",
  addBPDPrefix("/winning-transactions/transactions/presets"),
  (req, res) => {
    const folders = listDir(assetsFolder + "/bpd/award/winning_transactions");
    const folderFiles = folders.reduce((acc, curr) => {
      const files = listDir(
        `${assetsFolder}/bpd/award/winning_transactions/${curr}`
      );
      return { ...acc, [curr]: files };
    }, {});
    res.json(folderFiles);
  }
);

// return the configuration for total cashback (web dashboard)
installCustomHandler(
  bpdAward,
  "get",
  addBPDPrefix("/winning-transactions/total_cashback/presets"),
  (_, res) => {
    const folders = listDir(assetsFolder + "/bpd/award/total_cashback");
    const folderFiles = folders.reduce((acc, curr) => {
      const files = listDir(`${assetsFolder}/bpd/award/total_cashback/${curr}`);
      return { ...acc, [curr]: files };
    }, {});
    res.json(folderFiles);
  }
);

// update the configuration for total cashback (web dashboard)
installCustomHandler(
  bpdAward,
  "post",
  addBPDPrefix("/winning-transactions/total_cashback/presets"),
  (req, res) => {
    const payload = req.body;
    // check if the json is valid
    const maybeTotalCashBack = TotalCashbackResource.decode(
      readTotalCashbackJson(payload.directory, payload.file)
    );
    if (maybeTotalCashBack.isLeft()) {
      console.log(
        chalk.red(`${payload.file} is not a valid TotalCashbackResource`)
      );
      res.sendStatus(500);
    } else {
      totalCashback.set(payload.directory, payload.file);
      res.sendStatus(200);
    }
  }
);

// reset walletv2-bpd config (dashboard web)
installCustomHandler(
  bpdAward,
  "get",
  "/winning-transactions/reset",
  (_, res) => {
    initWinningTransaction();
    initTotalCashback();
    res.sendStatus(200);
  }
);
