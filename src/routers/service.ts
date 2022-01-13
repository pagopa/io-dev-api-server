import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { ServiceId } from "../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../generated/definitions/backend/ServicePreference";
import { ServiceScopeEnum } from "../../generated/definitions/backend/ServiceScope";
import { ioDevServerConfig } from "../config";
import { addHandler } from "../payloads/response";
import {
  getServices,
  getServicesPreferences,
  getServicesTuple
} from "../payloads/services";
import { sendFile } from "../utils/file";
import { addApiV1Prefix } from "../utils/strings";
import { publicRouter } from "./public";

export const serviceRouter = Router();

const configResponse = ioDevServerConfig.services.response;
export const services = getServices(
  ioDevServerConfig.services.national,
  ioDevServerConfig.services.local
);

export const visibleServices = getServicesTuple(services);
export const servicesPreferences = getServicesPreferences(services);

addHandler(serviceRouter, "get", addApiV1Prefix("/services"), (_, res) => {
  if (configResponse.getServicesResponseCode !== 200) {
    res.sendStatus(configResponse.getServicesResponseCode);
    return;
  }
  res.json(visibleServices.payload);
});

addHandler(
  serviceRouter,
  "get",
  addApiV1Prefix("/services/:service_id"),
  (req, res) => {
    if (configResponse.getServiceResponseCode !== 200) {
      res.sendStatus(configResponse.getServiceResponseCode);
      return;
    }
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
    if (configResponse.getServicesPreference !== 200) {
      res.sendStatus(configResponse.getServicesPreference);
      return;
    }
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
    if (configResponse.postServicesPreference !== 200) {
      res.sendStatus(configResponse.postServicesPreference);
      return;
    }
    const maybeUpdatePreference = ServicePreference.decode(req.body);
    if (E.isLeft(maybeUpdatePreference)) {
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
 * html page that shows all local services, embedded in an app webview
 */
addHandler(publicRouter, "get", "/services_web_view", (req, res) => {
  sendFile("assets/html/services_web_view.html", res);
});

/**
 * unofficial API!
 * dedicated API to get the local services from the web page
 */
addHandler(
  publicRouter,
  "get",
  "/services_web_view/local_services",
  (_, res) => {
    const localServices = services.filter(
      s => s.service_metadata?.scope === ServiceScopeEnum.LOCAL
    );
    res.json(localServices);
  }
);
