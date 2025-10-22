import { NonNegativeInteger } from "@pagopa/ts-commons/lib/numbers";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { PNActivation } from "../../../../generated/definitions/pn/PNActivation";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";
import ServicesDB from "../../services/persistence/servicesDatabase";
import { sendServiceId } from "../services/dataService";
import { logExpressResponseWarning } from "../../../utils/logging";
import { getProblemJson } from "../../../payloads/error";
import { ioDevServerConfig } from "../../../config";

export const sendServiceRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/pn${path}`);

addHandler(sendServiceRouter, "post", addPrefix("/activation"), (req, res) => {
  const maybeActivation = PNActivation.decode(req.body);
  if (E.isLeft(maybeActivation)) {
    const problemJson = getProblemJson(
      400,
      "Bad request body",
      `Unable to decode request body to PNActivation (${readableReportSimplified(
        maybeActivation.left
      )})`
    );
    logExpressResponseWarning(400, problemJson);
    res.status(400).json(problemJson);
    return;
  }
  const servicePreference = ServicesDB.getPreference(sendServiceId);
  if (servicePreference == null) {
    const problemJson = getProblemJson(
      500,
      "sendServiceId not found",
      `Unable to retrieve Service preferences for sendServiceId (${sendServiceId})`
    );
    logExpressResponseWarning(500, problemJson);
    res.status(500).json(problemJson);
    return;
  }

  const persistedServicePreference = ServicesDB.updatePreference(
    sendServiceId,
    {
      ...servicePreference,
      is_inbox_enabled: maybeActivation.right.activation_status,
      settings_version: (servicePreference.settings_version +
        1) as NonNegativeInteger
    }
  );
  if (!persistedServicePreference) {
    const problemJson = getProblemJson(
      500,
      "Preferences not updated",
      `Unable to update service preference for sendServiceId (${sendServiceId})`
    );
    logExpressResponseWarning(500, problemJson);
    res.status(500).json(problemJson);
    return;
  }
  if (ioDevServerConfig.send.isServiceUpsertRateLimited) {
    res
      .status(429)
      .json(
        getProblemJson(
          429,
          "Too Many Requests",
          "Service upsert rate limit exceeded"
        )
      );
    return;
  }
  res.status(204).send();
});
