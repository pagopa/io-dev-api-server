import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { ServiceId } from "../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../generated/definitions/backend/ServicePreference";
import { UpsertServicePreference } from "../../generated/definitions/backend/UpsertServicePreference";
import { ioDevServerConfig } from "../config";
import { addHandler } from "../payloads/response";
import { sendFile } from "../utils/file";
import { addApiV1Prefix } from "../utils/strings";
import { publicRouter } from "./public";
import ServicesDB from "./../persistence/services";
import { validatePayload } from "../utils/validator";
import { PaginatedServiceTupleCollection } from "../../generated/definitions/backend/PaginatedServiceTupleCollection";

export const serviceRouter = Router();
const configResponse = ioDevServerConfig.services.response;

addHandler(serviceRouter, "get", addApiV1Prefix("/services"), (_, res) => {
  if (configResponse.getServicesResponseCode !== 200) {
    res.sendStatus(configResponse.getServicesResponseCode);
    return;
  }
  const serviceSummaries = ServicesDB.getSummaries();
  const paginatedServiceSummaries = validatePayload(
    PaginatedServiceTupleCollection,
    {
      items: serviceSummaries,
      page_size: serviceSummaries.length
    }
  );
  res.json(paginatedServiceSummaries);
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
    const serviceId = req.params.service_id as ServiceId;
    const service = ServicesDB.getService(serviceId);
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
    const serviceId = req.params.service_id as ServiceId;
    const servicePreference = ServicesDB.getPreference(serviceId);
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
    const maybeUpdatePreference = UpsertServicePreference.decode(req.body);
    if (E.isLeft(maybeUpdatePreference)) {
      res.sendStatus(400);
      return;
    }
    const updatedPreference: ServicePreference = req.body;

    const serviceId = req.params.service_id as ServiceId;
    const servicePreference = ServicesDB.getPreference(serviceId);
    if (servicePreference === undefined) {
      res.sendStatus(404);
      return;
    }

    if (
      servicePreference.settings_version !== updatedPreference.settings_version
    ) {
      res.sendStatus(409);
      return;
    }
    const increasedSettingsVersion = ((servicePreference.settings_version as number) +
      1) as ServicePreference["settings_version"];
    const updatedServicePreference = {
      ...updatedPreference,
      settings_version: increasedSettingsVersion
    } as ServicePreference;
    const persistedServicePreference = ServicesDB.updatePreference(serviceId, updatedServicePreference);
    if (!persistedServicePreference) {
      res.sendStatus(500);
      return;
    }
    res.json(persistedServicePreference);
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
    const localServices = ServicesDB.getLocalServices();
    res.json(localServices);
  }
);
