/**
 * this router serves all data and assets provided by io-services-metadata https://github.com/pagopa/io-services-metadata
 */
import { Router } from "express";
import { availableBonuses } from "../features/bonus-vacanze/payloads/availableBonuses";
import { contextualHelpData } from "../payloads/contextualHelp";
import { municipality } from "../payloads/municipality";
import { getServiceMetadata } from "../payloads/service";
import { servicesByScope, servicesTuple } from "../server";
import { installHandler } from "../payloads/response";
import { publicRouter } from "./public";
import { Service } from "../../generated/definitions/content/Service";
import { ServicesByScope } from "../../generated/definitions/content/ServicesByScope";

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

installHandler(
  servicesMetadataRouter,
  "get",
  `/logos/organizations/:organization_id`,
  (_, res) => {
    // ignoring organization id and send always the same image
    res.sendFile("assets/imgs/logos/organizations/organization_1.png", {
      root: ".",
    });
    return null;
  }
);

installHandler(
  servicesMetadataRouter,
  "get",
  `/logos/services/:service_id`,
  (_, res) => {
    // ignoring service id and send always the same image
    res.sendFile("assets/imgs/logos/services/service_1.png", {
      root: ".",
    });
    return null;
  }
);

installHandler(
  servicesMetadataRouter,
  "get",
  `/municipalities/:A/:B/:CODE`,
  (_, res) => {
    // return always the same municipality
    res.json(municipality);
    return null;
  }
);

// get the list of all available bonus types
installHandler(
  servicesMetadataRouter,
  "get",
  `/bonus/vacanze/bonuses_available.json`,
  (_, res) => {
    res.json(availableBonuses);
    return null;
  }
);

installHandler(
  servicesMetadataRouter,
  "get",
  `/contextualhelp/data.json`,
  (_, res) => {
    res.json(contextualHelpData);
    return null;
  }
);
