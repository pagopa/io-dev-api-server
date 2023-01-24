import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { ServiceId } from "../../../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../../\../generated/definitions/backend/ServicePreference";
import { PNActivation } from "../../../../generated/definitions/pn/PNActivation";
import { addHandler } from "../../../payloads/response";
import { pnServiceId } from "../../../payloads/services/special";
import { addApiV1Prefix } from "../../../utils/strings";
import { servicesPreferences } from "../../service";

export const pnRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/pn${path}`);

addHandler(pnRouter, "post", addPrefix("/activation"), (req, res) => {
  const maybeActivation = PNActivation.decode(req.body);
  if (E.isLeft(maybeActivation)) {
    res.sendStatus(400);
    return;
  }
  const currentPreference = servicesPreferences.get(pnServiceId as ServiceId);

  if (currentPreference === undefined) {
    res.sendStatus(404);
    return;
  }

  const updatedPreference = {
    ...currentPreference,
    is_inbox_enabled: maybeActivation.right.activation_status
  };

  const increasedSettingsVersion = ((currentPreference.settings_version as number) +
    1) as ServicePreference["settings_version"];
  const servicePreference = {
    ...updatedPreference,
    settings_version: increasedSettingsVersion
  };
  servicesPreferences.set(pnServiceId as ServiceId, servicePreference);
  res.status(204).send();
});
