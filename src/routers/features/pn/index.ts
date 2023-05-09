import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { ServiceId } from "../../../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../../\../generated/definitions/backend/ServicePreference";
import { PNActivation } from "../../../../generated/definitions/pn/PNActivation";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";
import { pnServiceId } from "../../../payloads/services/special/pn/factoryPn";
import ServicesDB from "./../../../persistence/services";

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

  const increasedSettingsVersion = ((servicePreference.settings_version as number) +
    1) as ServicePreference["settings_version"];
  const updatedPreference = {
    is_inbox_enabled: maybeActivation.right.activation_status,
    settings_version: increasedSettingsVersion
  } as ServicePreference;
  ServicesDB.updatePreference(pnServiceId, updatedPreference);
  res.status(204).send();
});
