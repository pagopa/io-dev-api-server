import { NonNegativeInteger } from "@pagopa/ts-commons/lib/numbers";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { PNActivation } from "../../../../generated/definitions/pn/PNActivation";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";
import ServicesDB from "../../services/persistence/servicesDatabase";
import { pnServiceId } from "../services/services";

export const pnRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/pn${path}`);

addHandler(pnRouter, "post", addPrefix("/activation"), (req, res) => {
  const maybeActivation = PNActivation.decode(req.body);
  if (E.isLeft(maybeActivation)) {
    res.sendStatus(400);
    return;
  }
  const servicePreference = ServicesDB.getPreference(pnServiceId);

  if (servicePreference === undefined) {
    res.sendStatus(404);
    return;
  }

  const persistedServicePreference = ServicesDB.updatePreference(pnServiceId, {
    ...servicePreference,
    is_inbox_enabled: maybeActivation.right.activation_status,
    settings_version: (servicePreference.settings_version +
      1) as NonNegativeInteger
  });
  if (!persistedServicePreference) {
    res.sendStatus(500);
    return;
  }
  res.status(204).send();
});
