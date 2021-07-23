import { Router } from "express";
import { ServiceId } from "../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../generated/definitions/backend/ServicePreference";
import { servicesNumber } from "../global";
import { addHandler } from "../payloads/response";
import {
  getServices,
  getServicesPreferences,
  getServicesTuple,
  withSiciliaVolaService
} from "../payloads/service";
import { sendFile } from "../utils/file";
import { addApiV1Prefix } from "../utils/strings";
import { publicRouter } from "./public";
export const serviceRouter = Router();

export const services = withSiciliaVolaService(getServices(servicesNumber));
export const visibleServices = getServicesTuple(services);
const servicesPreferences = getServicesPreferences(services);

addHandler(serviceRouter, "get", addApiV1Prefix("/services"), (_, res) =>
  res.json(visibleServices.payload)
);

addHandler(
  serviceRouter,
  "get",
  addApiV1Prefix("/services/:service_id"),
  (req, res) => {
    const service = services.find(
      item => item.service_id === req.params.service_id
    );
    if (service === undefined) {
      res.sendStatus(404);
      return;
    }
    res.json(service);
  }
);

addHandler(
  serviceRouter,
  "get",
  addApiV1Prefix("/services/:service_id/preferences"),
  (req, res) => {
    const servicePreference = servicesPreferences.get(
      req.params.service_id as ServiceId
    );
    if (servicePreference === undefined) {
      res.sendStatus(404);
      return;
    }
    res.json(servicePreference);
  }
);

addHandler(
  serviceRouter,
  "post",
  addApiV1Prefix("/services/:service_id/preferences"),
  (req, res) => {
    const maybeUpdatePreference = ServicePreference.decode(req.body);
    if (maybeUpdatePreference.isLeft()) {
      res.sendStatus(400);
      return;
    }
    const updatedPreference: ServicePreference = req.body;

    const currentPreference = servicesPreferences.get(
      req.params.service_id as ServiceId
    );

    if (currentPreference === undefined) {
      res.sendStatus(404);
      return;
    }

    if (
      currentPreference.settings_version !== updatedPreference.settings_version
    ) {
      res.sendStatus(409);
      return;
    }
    const increasedSettingsVersion = ((currentPreference.settings_version as number) +
      1) as ServicePreference["settings_version"];
    const servicePreference = {
      ...updatedPreference,
      settings_version: increasedSettingsVersion
    };
    servicesPreferences.set(
      req.params.service_id as ServiceId,
      servicePreference
    );
    res.json(servicePreference);
  }
);

/**
 * just for test purposes
 * an html test page to trigger the services webview
 * see https://www.pivotaltracker.com/story/show/177226606
 */
addHandler(publicRouter, "get", "/services_web_view", (req, res) => {
  sendFile("assets/html/services_web_view.html", res);
});
