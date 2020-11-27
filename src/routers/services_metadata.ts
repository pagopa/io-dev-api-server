/**
 * this router serves all data and assets provided by io-services-metadata https://github.com/pagopa/io-services-metadata
 */
import { Response, Router } from "express";
import { Service } from "../../generated/definitions/content/Service";
import { ServicesByScope } from "../../generated/definitions/content/ServicesByScope";
import { staticContentRootPath } from "../global";
import {
  availableBonuses,
  availableBonusesv1,
  availableBonusesv2
} from "../payloads/bonusAvailable";
import { contextualHelpData } from "../payloads/contextualHelp";
import { legacyAvailableBonuses } from "../payloads/features/bonus-vacanze/availableBonuses";
import { municipality } from "../payloads/municipality";
import { installCustomHandler, installHandler } from "../payloads/response";
import { getServiceMetadata } from "../payloads/service";
import { sendFile } from "../utils/file";
import { servicesByScope, visibleServices } from "./service";

export const servicesMetadataRouter = Router();

const addRoutePrefix = (path: string) => `${staticContentRootPath}${path}`;

installHandler<Service | ServicesByScope>(
  servicesMetadataRouter,
  "get",
  addRoutePrefix(`/services/:service_id`),
  req => {
    const serviceId = req.params.service_id.replace(".json", "");
    if (serviceId === "servicesByScope") {
      return servicesByScope;
    }
    return getServiceMetadata(serviceId, visibleServices.payload);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/organizations/:organization_id"),
  (_, res) => {
    // ignoring organization id and send always the same image
    sendFile("assets/imgs/logos/organizations/organization_1.png", res);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/services/:service_id"),
  (_, res) => {
    // ignoring service id and send always the same image
    sendFile("assets/imgs/logos/services/service_1.png", res);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/municipalities/:a/:b/:code"),
  (_, res) => {
    // return always the same municipality
    res.json(municipality);
  }
);

// get the list of all available bonus types
installCustomHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/bonus/vacanze/bonuses_available.json"),
  (_, res) => {
    res.json(legacyAvailableBonuses);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/bonus/bonus_available.json"),
  (_, res) => {
    res.json(availableBonuses);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/bonus/bonus_available_v1.json"),
  (_, res) => {
    res.json(availableBonusesv1);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/bonus/bonus_available_v2.json"),
  (_, res) => {
    res.json(availableBonusesv2);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/contextualhelp/data.json"),
  (_, res) => {
    res.json(contextualHelpData);
  }
);
