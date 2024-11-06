import { Router } from "express";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { ulid } from "ulid";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";
import { getProblemJson } from "../../../payloads/error";
import {
  generateAccessHistoryData,
  isProcessingExport,
  nextAccessHistoryPageFromRequest
} from "../services/historyService";
import { getFimsConfig } from "../services/configurationService";
import { FIMSConfig } from "../types/config";
import { Access } from "../../../../generated/definitions/fims_history/Access";
import { LastExportRequest } from "../types/lastExportRequest";
import { ExportRequest } from "../../../../generated/definitions/fims_history/ExportRequest";

export const fimsHistoryRouter = Router();

// eslint-disable-next-line functional/no-let
let history: O.Option<ReadonlyArray<Access>> = O.none;
// eslint-disable-next-line functional/no-let
let lastExportRequest: O.Option<LastExportRequest> = O.none;

addHandler(
  fimsHistoryRouter,
  "get",
  addApiV1Prefix("/fims/accesses"),
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

    const nextAccessHistoryPageEither = nextAccessHistoryPageFromRequest(
      config,
      history,
      req
    );
    if (E.isLeft(nextAccessHistoryPageEither)) {
      res
        .status(400)
        .send(getProblemJson(400, nextAccessHistoryPageEither.left));
      return;
    }

    res.status(200).send(nextAccessHistoryPageEither.right);
  },
  () => Math.floor(2500 * Math.random())
);

addHandler(
  fimsHistoryRouter,
  "post",
  addApiV1Prefix("/fims/export-requests"),
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
      lastExportRequest
    );
    if (isStillProcessingExport) {
      res
        .status(409)
        .send(
          getProblemJson(409, "The export request has already been requested")
        );
      return;
    }

    const exportRequestId = ulid();
    lastExportRequest = O.some({
      id: exportRequestId,
      timestamp: Date.now()
    });
    const exportRequest: ExportRequest = {
      id: exportRequestId
    };
    res.status(202).send(exportRequest);
  },
  () => Math.floor(2500 + 1400 * Math.random())
);

const initializeIfNeeded = (config: FIMSConfig) => {
  if (O.isSome(history)) {
    return;
  }
  history = O.some(generateAccessHistoryData(config));
};
