/**
 * this router serves all data and assets provided by io-services-metadata https://github.com/pagopa/io-services-metadata
 */
import { Response, Router } from "express";
import { Service } from "../../generated/definitions/content/Service";
import { ServicesByScope } from "../../generated/definitions/content/ServicesByScope";
import { availableBonuses } from "../payloads/bonusAvailable";
import { contextualHelpData } from "../payloads/contextualHelp";
import { legacyAvailableBonuses } from "../payloads/features/bonus-vacanze/availableBonuses";
import { municipality } from "../payloads/municipality";
import { installCustomHandler, installHandler } from "../payloads/response";
import { getServiceMetadata } from "../payloads/service";
import { servicesByScope, visibleServices } from "./service";

export const servicesMetadataRouter = Router();

installHandler<Service | ServicesByScope>(
  servicesMetadataRouter,
  "get",
  `/services/:service_id`,
  req => {
    const serviceId = req.params.service_id.replace(".json", "");
    if (serviceId === "servicesByScope") {
      return servicesByScope;
    }
    return getServiceMetadata(serviceId, visibleServices.payload);
  }
);

const sendFile = (file: string, res: Response) =>
  res.sendFile(file, {
    root: "."
  });

installCustomHandler(
  servicesMetadataRouter,
  "get",
  `/logos/organizations/:organization_id`,
  (_, res) => {
    // ignoring organization id and send always the same image
    sendFile("assets/imgs/logos/organizations/organization_1.png", res);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  `/logos/services/:service_id`,
  (_, res) => {
    // ignoring service id and send always the same image
    sendFile("assets/imgs/logos/services/service_1.png", res);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  `/municipalities/:a/:b/:code`,
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
    res.json(legacyAvailableBonuses);
  }
);

installCustomHandler(
  servicesMetadataRouter,
  "get",
  `/bonus/bonus_available.json`,
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
