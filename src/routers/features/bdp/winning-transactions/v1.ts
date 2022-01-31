import chalk from "chalk";

import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { TotalCashbackResource } from "../../../../../generated/definitions/bpd/winning_transactions/TotalCashbackResource";
import { assetsFolder } from "../../../../config";
import { Plugin } from "../../../../core/server";

import { PatchedBpdWinningTransactions } from "../../../../types/PatchedBpdWinningTransactions";
import { listDir, readFileAsJSON } from "../../../../utils/file";

import { addBPDPrefix } from "../index";

const readTotalCashbackJson = (directoryName: string, fileName: string) =>
  readFileAsJSON(
    `${assetsFolder}/bpd/award/total_cashback/${directoryName}/${fileName}`
  );

const readWinningTransactions = (directoryName: string, fileName: string) =>
  readFileAsJSON(
    `${assetsFolder}/bpd/award/winning_transactions/${directoryName}/${fileName}`
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

// tslint:disable-next-line: no-let
let winningTransactions: Map<number, string> = new Map<number, string>();

const initWinningTransaction = () => {
  winningTransactions = new Map<number, string>([
    [0, "default.json"],
    [1, "default.json"],
    [2, "default.json"],
    [3, "default.json"],
    [4, "default.json"]
  ]);
};

initWinningTransaction();

export const BPDWinningTransactionsV1Plugin: Plugin = async ({
  handleRoute
}) => {
  // get the total cashback from a given awardPeriodId
  handleRoute(
    "get",
    addBPDPrefix("/io/winning-transactions/total-cashback"),
    (req, res) => {
      const awardPeriodId = parseInt(req.query.awardPeriodId as string, 10);
      pipe(
        O.fromNullable(totalCashback.get(awardPeriodId)),
        O.fold(
          () => {
            res.sendStatus(404);
          },
          p => {
            const maybeTotalCashBack = TotalCashbackResource.decode(
              readTotalCashbackJson(req.query.awardPeriodId as string, p)
            );

            if (E.isLeft(maybeTotalCashBack)) {
              console.log(
                chalk.red(`${p} is not a valid TotalCashbackResource`)
              );
              res.sendStatus(500);
            } else {
              res.json(maybeTotalCashBack.value);
            }
          }
        )
      );
    }
  );

  // return the cashback winning transaction given a periodId and an hPan
  handleRoute("get", addBPDPrefix("/io/winning-transactions"), (req, res) => {
    const awardPeriodId = parseInt(req.query.awardPeriodId as string, 10);
    if (!winningTransactions.has(awardPeriodId)) {
      res.sendStatus(404);
      return;
    }
    const response = (period: number, file: string) => {
      const maybeTransactions = PatchedBpdWinningTransactions.decode(
        readWinningTransactions(period.toString(), file)
      );
      if (E.isLeft(maybeTransactions)) {
        console.log(
          chalk.red(
            `${period.toString()}/${file} is not a valid PatchedBpdWinningTransactions\n${readableReport(
              maybeTransactions.value
            )}`
          )
        );
        res.sendStatus(500);
      } else {
        res.json(maybeTransactions.value);
      }
    };
    if (!winningTransactions.get(awardPeriodId)) {
      res.sendStatus(404);
      return;
    }
    const jsonFile = winningTransactions.get(awardPeriodId)!;
    response(awardPeriodId, jsonFile);
  });

  // update the configuration for winning transactions (web dashboard)
  handleRoute(
    "post",
    addBPDPrefix("/winning-transactions/transactions/presets"),
    (req, res) => {
      const payload = req.body;
      // check if the json is valid
      const maybeTransactions = PatchedBpdWinningTransactions.decode(
        readWinningTransactions(payload.period, payload.file)
      );
      if (E.isLeft(maybeTransactions)) {
        console.log(
          chalk.red(
            `${payload.file} is not a valid PatchedBpdWinningTransactions`
          )
        );
        res.sendStatus(500);
      } else {
        winningTransactions.set(parseInt(payload.period, 10), payload.file);
        res.sendStatus(200);
      }
    }
  );

  // return the configuration for winning-transactions (web dashboard)
  handleRoute(
    "get",
    addBPDPrefix("/winning-transactions/transactions/presets"),
    (req, res) => {
      const folders = listDir(assetsFolder + "/bpd/award/winning_transactions");
      const folderFiles = folders.reduce(
        (acc: Record<string, ReadonlyArray<string>>, curr: string) => {
          const files = listDir(
            `${assetsFolder}/bpd/award/winning_transactions/${curr}`
          );
          return { ...acc, [curr]: files };
        },
        {}
      );
      res.json(folderFiles);
    }
  );

  // return the configuration for total cashback (web dashboard)
  handleRoute(
    "get",
    addBPDPrefix("/winning-transactions/total_cashback/presets"),
    (_, res) => {
      const folders = listDir(assetsFolder + "/bpd/award/total_cashback");
      const folderFiles = folders.reduce(
        (acc: Record<string, ReadonlyArray<string>>, curr: string) => {
          const files = listDir(
            `${assetsFolder}/bpd/award/total_cashback/${curr}`
          );
          return { ...acc, [curr]: files };
        },
        {}
      );
      res.json(folderFiles);
    }
  );

  // update the configuration for total cashback (web dashboard)
  handleRoute(
    "post",
    addBPDPrefix("/winning-transactions/total_cashback/presets"),
    (req, res) => {
      const payload = req.body;
      // check if the json is valid
      const maybeTotalCashBack = TotalCashbackResource.decode(
        readTotalCashbackJson(payload.directory, payload.file)
      );
      if (E.isLeft(maybeTotalCashBack)) {
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
  handleRoute("get", "/winning-transactions/reset", (_, res) => {
    initWinningTransaction();
    initTotalCashback();
    res.sendStatus(200);
  });
};
