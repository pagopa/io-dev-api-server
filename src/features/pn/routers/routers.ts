import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { NonNegativeInteger } from "@pagopa/ts-commons/lib/numbers";
import { addApiV1Prefix } from "../../../utils/strings";
import { addHandler } from "../../../payloads/response";
import { PNActivation } from "../../../../generated/definitions/pn/PNActivation";
import ServicesDB from "../../services/persistence/servicesDatabase";
import { pnServiceId } from "../services/services";
import { ServicePreference } from "../../../../generated/definitions/backend/ServicePreference";

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

  const increasedSettingsVersion =
    ((servicePreference.settings_version as number) + 1) as NonNegativeInteger;
  const updatedPreference = {
    is_inbox_enabled: maybeActivation.right.activation_status,
    settings_version: increasedSettingsVersion
  } as ServicePreference;
  const persistedServicePreference = ServicesDB.updatePreference(
    pnServiceId,
    updatedPreference
  );
  if (!persistedServicePreference) {
    res.sendStatus(500);
    return;
  }
  res.status(204).send();
});
