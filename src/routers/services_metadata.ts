/**
 * this router serves all data and assets provided by io-services-metadata https://github.com/pagopa/io-services-metadata
 */
import { Router } from "express";
import { availableBonuses } from "../bonus-vacanze/payloads/availableBonuses";
import { contextualHelpData } from "../payloads/contextualHelp";
import { municipality } from "../payloads/municipality";
import { getServiceMetadata } from "../payloads/service";
import { sendFile, servicesByScope, servicesTuple } from "../server";

export const servicesMetadataRouter = Router();

servicesMetadataRouter.get(`/services/:service_id`, (req, res) => {
  const serviceId = req.params.service_id.replace(".json", "");
  if (serviceId === "servicesByScope") {
    res.json(servicesByScope.payload);
    return;
  }
  res.json(getServiceMetadata(serviceId, servicesTuple.payload).payload);
});

servicesMetadataRouter.get(
  `/logos/organizations/:organization_id`,
  (_, res) => {
    // ignoring organization id and send always the same image
    sendFile("assets/imgs/logos/organizations/organization_1.png", res);
  }
);

servicesMetadataRouter.get(`/logos/services/:service_id`, (_, res) => {
  // ignoring service id and send always the same image
  sendFile("assets/imgs/logos/services/service_1.png", res);
});

servicesMetadataRouter.get(`/municipalities/:A/:B/:CODE`, (_, res) => {
  // return always the same municipality
  res.json(municipality);
});

// get the list of all available bonus types
servicesMetadataRouter.get(
  `/bonus/vacanze/bonuses_available.json`,
  (_, res) => {
    res.json(availableBonuses);
  }
);

servicesMetadataRouter.get(`/contextualhelp/data.json`, (_, res) => {
  res.json(contextualHelpData);
});
