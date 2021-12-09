/**
 * this router serves all data and assets provided by io-services-metadata https://github.com/pagopa/io-services-metadata
 */
import { Router } from "express";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { CoBadgeServices } from "../../generated/definitions/pagopa/cobadge/configuration/CoBadgeServices";
import { PrivativeServices } from "../../generated/definitions/pagopa/privative/configuration/PrivativeServices";
import { assetsFolder, staticContentRootPath } from "../config";
import { backendStatus } from "../payloads/backend";
import { municipality } from "../payloads/municipality";
import { addHandler } from "../payloads/response";
import { zendeskConfig } from "../payloads/zendesk";
import { readFileAsJSON, sendFile } from "../utils/file";
import { services } from "./service";

export const servicesMetadataRouter = Router();

const addRoutePrefix = (path: string) => `${staticContentRootPath}${path}`;

/**
 * @deprecated the app should not use this API. It should consume metadata contained in the service detail
 */
addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix(`/services/:service_id`),
  (req, res) => {
    const serviceId = req.params.service_id.split(".")[0];
    const service = services.find(s => s.service_id === serviceId);
    if (service === undefined || service.service_metadata === undefined) {
      res.sendStatus(404);
      return;
    }
    res.json(service.service_metadata);
  }
);

// backend service status
addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/status/backend.json"),
  (_, res) => res.json(backendStatus)
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
  addRoutePrefix("/logos/privative/gdo/:logo_id"),
  (req, res) => {
    sendFile(`assets/imgs/logos/privative/gdo/${req.params.logo_id}`, res);
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/privative/loyalty/:logo_id"),
  (req, res) => {
    sendFile(`assets/imgs/logos/privative/loyalty/${req.params.logo_id}`, res);
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
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/status/cobadgeServices.json"),
  (req, res) => {
    const decoded = CoBadgeServices.decode(
      readFileAsJSON(assetsFolder + "/data/cobadgeServices.json")
    );
    if (decoded.isLeft()) {
      res.status(500).send(readableReport(decoded.value));
      return;
    }
    res.json(decoded.value);
  },
  0
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/status/privativeServices.json"),
  (req, res) => {
    const decoded = PrivativeServices.decode(
      readFileAsJSON(assetsFolder + "/data/privativeServices.json")
    );
    if (decoded.isLeft()) {
      res.status(500).send(readableReport(decoded.value));
      return;
    }
    res.json(decoded.value);
  },
  0
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/spid/idps/list.json"),
  (_, res) => res.json(readFileAsJSON(assetsFolder + "/spid/idps/list.json"))
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/spid/idps/:spid_logo"),
  (req, res) => {
    sendFile(`assets/imgs/logos/spid/${req.params.spid_logo}`, res);
  }
);
addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/assistanceTools/zendesk.json"),
  (req, res) => res.json(zendeskConfig)
);
