/**
 * this router serves all data and assets provided by io-services-metadata https://github.com/pagopa/io-services-metadata
 */
import { Router } from "express";
import { availableBonuses } from "../payloads/features/bonus-vacanze/availableBonuses";
import { contextualHelpData } from "../payloads/contextualHelp";
import { municipality } from "../payloads/municipality";
import { getServiceMetadata } from "../payloads/service";
import { installCustomHandler, installHandler } from "../payloads/response";
import { publicRouter } from "./public";
import { Service } from "../../generated/definitions/content/Service";
import { ServicesByScope } from "../../generated/definitions/content/ServicesByScope";
import { servicesByScope, servicesTuple } from "./message";

export const servicesMetadataRouter = Router();

installHandler<Service | ServicesByScope>(
  servicesMetadataRouter,
  "get",
  `/services/:service_id`,
  (req) => {
    const serviceId = req.params.service_id.replace(".json", "");
    if (serviceId === "servicesByScope") {
      return servicesByScope;
    }
    return getServiceMetadata(serviceId, servicesTuple.payload);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  `/logos/organizations/:organization_id`,
  (_, res) => {
    // ignoring organization id and send always the same image
    res.sendFile("assets/imgs/logos/organizations/organization_1.png", {
      root: ".",
    });
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  `/logos/services/:service_id`,
  (_, res) => {
    // ignoring service id and send always the same image
    res.sendFile("assets/imgs/logos/services/service_1.png", {
      root: ".",
    });
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  `/municipalities/:A/:B/:CODE`,
  (_, res) => {
    // return always the same municipality
    res.json(municipality);
  }
);

// get the list of all available bonus types
installCustomHandler(
  servicesMetadataRouter,
  "get",
  `/bonus/vacanze/bonuses_available.json`,
  (_, res) => {
    res.json(availableBonuses);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  `/contextualhelp/data.json`,
  (_, res) => {
    res.json(contextualHelpData);
  }
);
