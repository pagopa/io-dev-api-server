/**
 * this router serves all data and assets provided by io-services-metadata https://github.com/pagopa/io-services-metadata
 */
import { Router } from "express";
import { Service } from "../../generated/definitions/content/Service";
import { ServicesByScope } from "../../generated/definitions/content/ServicesByScope";
import { CoBadgeServices } from "../../generated/definitions/pagopa/cobadge/configuration/CoBadgeServices";
import { assetsFolder, staticContentRootPath } from "../global";
import { municipality } from "../payloads/municipality";
import { addHandler } from "../payloads/response";
import { getServiceMetadata } from "../payloads/service";
import { readFileAsJSON, sendFile } from "../utils/file";
import { servicesByScope, visibleServices } from "./service";
import { wallet2Router } from "./walletsV2";

export const servicesMetadataRouter = Router();

const addRoutePrefix = (path: string) => `${staticContentRootPath}${path}`;

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix(`/services/:service_id`),
  (req, res) => {
    const serviceId = req.params.service_id.replace(".json", "");
    if (serviceId === "servicesByScope") {
      res.json(servicesByScope.payload);
      return;
    }
    res.json(getServiceMetadata(serviceId, visibleServices.payload).payload);
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/organizations/:organization_id"),
  (_, res) => {
    // ignoring organization id and send always the same image
    sendFile("assets/imgs/logos/organizations/organization_1.png", res);
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/services/:service_id"),
  (_, res) => {
    // ignoring service id and send always the same image
    sendFile("assets/imgs/logos/services/service_1.png", res);
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/abi/:logo_id"),
  (req, res) => {
    sendFile(`assets/imgs/logos/abi/${req.params.logo_id}`, res);
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/municipalities/:a/:b/:code"),
  (_, res) => {
    // return always the same municipality
    res.json(municipality);
  }
);

// get the list of all available bonus types
addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/bonus/vacanze/bonuses_available.json"),
  (_, res) =>
    res.json(
      readFileAsJSON(
        assetsFolder + "/bonus_available/bonus_available_legacy.json"
      )
    )
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/bonus/bonus_available.json"),
  (_, res) =>
    res.json(
      readFileAsJSON(assetsFolder + "/bonus_available/bonus_available.json")
    )
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/bonus/bonus_available_v1.json"),
  (_, res) =>
    res.json(
      readFileAsJSON(assetsFolder + "/bonus_available/bonus_available_v1.json")
    )
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/bonus/bonus_available_v2.json"),
  (_, res) =>
    res.json(
      readFileAsJSON(assetsFolder + "/bonus_available/bonus_available_v2.json")
    )
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/contextualhelp/data.json"),
  (_, res) =>
    res.json(readFileAsJSON(assetsFolder + "/contextual_help/data.json"))
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/status/abi.json"),
  (_, res) => {
    res.json(readFileAsJSON(assetsFolder + "/data/abi.json"));
  }
);

addHandler(
  wallet2Router,
  "get",
  addRoutePrefix("/status/cobadgeServices.json"),
  (req, res) =>
    res.json(readFileAsJSON(assetsFolder + "/data/cobadgeServices.json")),
  0
);
