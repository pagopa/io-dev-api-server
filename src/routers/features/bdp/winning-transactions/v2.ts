import chalk from "chalk";

import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { TotalCashbackResource } from "../../../../../generated/definitions/bpd/winning_transactions/TotalCashbackResource";
import { TrxCountByDayResourceArray } from "../../../../../generated/definitions/bpd/winning_transactions/v2/TrxCountByDayResourceArray";
import { WinningTransactionPageResource } from "../../../../../generated/definitions/bpd/winning_transactions/v2/WinningTransactionPageResource";
import { assetsFolder } from "../../../../config";
import { Plugin } from "../../../../core/server";
import { listDir, readFileAsJSON } from "../../../../utils/file";
import { addBPDPrefix } from "../index";

const readTotalCashbackJson = (directoryName: string, fileName: string) =>
  readFileAsJSON(
    `${assetsFolder}/bpd/award/total_cashback/${directoryName}/${fileName}`
  );

const readWinningTransactions = (directoryName: string, fileName: string) =>
  readFileAsJSON(
    `${assetsFolder}/bpd/award/winning_transactions/v2/${directoryName}/${fileName}`
  );

const readCountByDayJson = (directoryName: string, fileName: string) =>
  readFileAsJSON(
    `${assetsFolder}/bpd/award/winning_transactions/v2/countByDay/${directoryName}/${fileName}`
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
    [0, "default_.json"],
    [1, "default_.json"],
    [2, "default_.json"],
    [3, "default_.json"],
    [4, "default_.json"]
  ]);
};
initWinningTransaction();

// tslint:disable-next-line: no-let
let countByDay: Map<number, string>;

const initCountByDay = () => {
  countByDay = new Map<number, string>([
    [0, "default.json"],
    [1, "default.json"],
    [2, "default.json"],
    [3, "default.json"],
    [4, "default.json"]
  ]);
};
initCountByDay();

export const BPDWinningTransactionsV2Plugin: Plugin = async ({
  handleRoute
  // tslint:disable-next-line:no-big-function
}) => {
  // get the total cashback from a given awardPeriodId
  handleRoute(
    "get",
    addBPDPrefix("/io/winning-transactions/v2/total-cashback"),
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
  handleRoute(
    "get",
    addBPDPrefix("/io/winning-transactions/v2"),
    (req, res) => {
      const awardPeriodId = parseInt(req.query.awardPeriodId as string, 10);

      if (!winningTransactions.has(awardPeriodId)) {
        res.sendStatus(404);
        return;
      }
      const cursor = req.query.nextCursor
        ? parseInt(req.query.nextCursor as string, 10)
        : 0;

      const response = (period: number, file: string) => {
        try {
          const maybeTransactions = WinningTransactionPageResource.decode(
            readWinningTransactions(period.toString(), file)
          );
          if (E.isLeft(maybeTransactions)) {
            console.log(
              chalk.red(
                `${period.toString()}/${file} is not a valid WinningTransactionPageResource\n${readableReport(
                  maybeTransactions.value
                )}`
              )
            );
            res.sendStatus(500);
          } else {
            res.json(maybeTransactions.value);
          }
        } catch (e) {
          if (
            e instanceof Error &&
            e.message.includes("no such file or directory")
          ) {
            console.log(chalk.red(e.message));
            res.sendStatus(404);
            return;
          }
          throw e;
        }
      };
      if (!winningTransactions.get(awardPeriodId)) {
        res.sendStatus(404);
        return;
      }
      const jsonFile = winningTransactions.get(awardPeriodId)!.split(".");
      const jsonFileWithPage = `${jsonFile[0]}${cursor}.${jsonFile[1]}`;
      response(awardPeriodId, jsonFileWithPage);
    }
  );

  // get the countbyday a given awardPeriodId
  handleRoute(
    "get",
    addBPDPrefix("/io/winning-transactions/v2/countbyday"),
    (req, res) => {
      const awardPeriodId = parseInt(req.query.awardPeriodId as string, 10);
      pipe(
        O.fromNullable(countByDay.get(awardPeriodId)),
        O.fold(
          () => {
            res.sendStatus(404);
          },
          p => {
            const maybeCountByDay = TrxCountByDayResourceArray.decode(
              readCountByDayJson(req.query.awardPeriodId as string, p)
            );

            if (E.isLeft(maybeCountByDay)) {
              console.log(
                chalk.red(`${p} is not a valid TrxCountByDayResourceArray`)
              );
              res.sendStatus(500);
            } else {
              res.json(maybeCountByDay.value);
            }
          }
        )
      );
    }
  );

  // update the configuration for winning transactions (web dashboard)
  handleRoute(
    "post",
    addBPDPrefix("/winning-transactions/transactions/v2/presets"),
    (req, res) => {
      const payload = req.body;
      // check if the json is valid
      const maybeTransactions = WinningTransactionPageResource.decode(
        readWinningTransactions(payload.period, payload.file)
      );
      if (E.isLeft(maybeTransactions)) {
        console.log(
          chalk.red(
            `${payload.file} is not a valid WinningTransactionPageResource`
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
    addBPDPrefix("/winning-transactions/transactions/v2/presets"),
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
    addBPDPrefix("/winning-transactions/v2/total_cashback/presets"),
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
    addBPDPrefix("/winning-transactions/v2/total_cashback/presets"),
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
  handleRoute("get", "/winning-transactions/v2/reset", (_, res) => {
    initWinningTransaction();
    initTotalCashback();
    res.sendStatus(200);
  });
};
