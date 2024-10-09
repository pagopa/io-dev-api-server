import { Router } from "express";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";
import { getProblemJson } from "../../../payloads/error";
import { HistoryPieceOfData } from "../types/history";
import {
  generateHistory,
  isProcessingExport,
  nextPageFromRequest
} from "../services/historyService";
import { getFimsConfig } from "../services/configurationService";
import { FIMSConfig } from "../types/config";

export const fimsHistoryRouter = Router();

// eslint-disable-next-line functional/no-let
let history: HistoryPieceOfData[] | null = null;
// eslint-disable-next-line functional/no-let
let lastExportRequestTimestamp: number = 0;

addHandler(
  fimsHistoryRouter,
  "get",
  addApiV1Prefix("/fims/consents"),
  (req, res) => {
    const config = getFimsConfig();
    const failureResponseCode =
      config.history.consentsEndpointFailureStatusCode;
    if (failureResponseCode) {
      res
        .status(failureResponseCode)
        .send(getProblemJson(failureResponseCode, "Simulated error"));
      return;
    }

    initializeIfNeeded(config);

    const nextPage = nextPageFromRequest(config, history, req);
    if (typeof nextPage === "string") {
      res.status(500).send(getProblemJson(500, nextPage));
      return;
    }

    res.status(200).send(nextPage);
  },
  () => Math.floor(2500 * Math.random())
);

addHandler(
  fimsHistoryRouter,
  "post",
  addApiV1Prefix("/fims/exports"),
  (_req, res) => {
    const config = getFimsConfig();
    const failureResponseCode = config.history.exportEndpointFailureStatusCode;
    if (failureResponseCode) {
      res
        .status(failureResponseCode)
        .send(getProblemJson(failureResponseCode, "Simulated error"));
      return;
    }

    const isStillProcessingExport = isProcessingExport(
      config,
      lastExportRequestTimestamp
    );
    if (isStillProcessingExport) {
      res.status(409).send();
      return;
    }

    lastExportRequestTimestamp = Date.now();
    res.status(202).send();
  },
  () => Math.floor(2500 + 1400 * Math.random())
);

const initializeIfNeeded = (config: FIMSConfig) => {
  if (history) {
    return;
  }
  history = generateHistory(config);
};
