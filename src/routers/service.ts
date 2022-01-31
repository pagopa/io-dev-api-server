import * as E from "fp-ts/lib/Either";
import { ServiceId } from "../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../generated/definitions/backend/ServicePreference";
import { ServiceScopeEnum } from "../../generated/definitions/backend/ServiceScope";

import { Plugin } from "../core/server";
import { HttpResponseCode } from "./message";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";

import {
  getServices,
  getServicesPreferences,
  getServicesTuple
} from "../payloads/services";

import { addApiV1Prefix } from "../utils/strings";

type ServicePluginOptions = {
  services: {
    response: {
      getServicesPreference: HttpResponseCode;
      getServicesResponseCode: HttpResponseCode;
      postServicesPreference: HttpResponseCode;
      getServiceResponseCode: HttpResponseCode;
    };
    national: number;
    local: number;
  };
};

export let services: ReadonlyArray<ServicePublic> = [];
export let visibleServices = getServicesTuple(services);
export let servicesPreferences = getServicesPreferences(services);

export const ServicePlugin: Plugin<ServicePluginOptions> = async (
  { handleRoute, sendFile },
  options
) => {
  services = getServices(options.services.national, options.services.local);

  visibleServices = getServicesTuple(services);
  servicesPreferences = getServicesPreferences(services);

  const configResponse = options.services.response;

  handleRoute("get", addApiV1Prefix("/services"), (_, res) => {
    if (configResponse.getServicesResponseCode !== 200) {
      res.sendStatus(configResponse.getServicesResponseCode);
      return;
    }
    res.json(visibleServices.payload);
  });

  handleRoute("get", addApiV1Prefix("/services/:service_id"), (req, res) => {
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
  });

  handleRoute(
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

  handleRoute(
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
        currentPreference.settings_version !==
        updatedPreference.settings_version
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
  handleRoute("get", "/services_web_view", (req, res) => {
    sendFile("assets/html/services_web_view.html", res);
  });

  /**
   * unofficial API!
   * dedicated API to get the local services from the web page
   */
  handleRoute("get", "/services_web_view/local_services", (_, res) => {
    const localServices = services.filter(
      s => s.service_metadata?.scope === ServiceScopeEnum.LOCAL
    );
    res.json(localServices);
  });
};
