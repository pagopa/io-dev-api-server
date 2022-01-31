/**
 * this router serves all data and assets provided by io-services-metadata https://github.com/pagopa/io-services-metadata
 */

import * as E from "fp-ts/lib/Either";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { Zendesk } from "../../generated/definitions/content/Zendesk";
import { CoBadgeServices } from "../../generated/definitions/pagopa/cobadge/configuration/CoBadgeServices";
import { PrivativeServices } from "../../generated/definitions/pagopa/privative/configuration/PrivativeServices";
import { assetsFolder, staticContentRootPath } from "../config";
import { backendStatus } from "../payloads/backend";
import { municipality } from "../payloads/municipality";

import { readFileAsJSON } from "../utils/file";
import { validatePayload } from "../utils/validator";
import { services } from "./service";

import { Plugin } from "../core/server";

const addRoutePrefix = (path: string) => `${staticContentRootPath}${path}`;

export const ServiceMetadataPlugin: Plugin = async ({
  handleRoute,
  sendFile
}) => {
  /**
   * @deprecated the app should not use this API. It should consume metadata contained in the service detail
   */
  handleRoute("get", addRoutePrefix(`/services/:service_id`), (req, res) => {
    const serviceId = req.params.service_id.split(".")[0];
    const service = services.find(s => s.service_id === serviceId);
    if (service === undefined || service.service_metadata === undefined) {
      res.sendStatus(404);
      return;
    }
    res.json(service.service_metadata);
  });

  // backend service status
  handleRoute("get", addRoutePrefix("/status/backend.json"), (_, res) =>
    res.json(backendStatus)
  );

  handleRoute(
    "get",
    addRoutePrefix("/logos/organizations/:organization_id"),
    (_, res) => {
      // ignoring organization id and send always the same image
      sendFile("assets/imgs/logos/organizations/organization_1.png", res);
    }
  );

  handleRoute(
    "get",
    addRoutePrefix("/logos/services/:service_id"),
    (_, res) => {
      // ignoring service id and send always the same image
      sendFile("assets/imgs/logos/services/service_1.png", res);
    }
  );

  handleRoute("get", addRoutePrefix("/logos/abi/:logo_id"), (req, res) => {
    sendFile(`assets/imgs/logos/abi/${req.params.logo_id}`, res);
  });

  handleRoute(
    "get",
    addRoutePrefix("/logos/privative/gdo/:logo_id"),
    (req, res) => {
      sendFile(`assets/imgs/logos/privative/gdo/${req.params.logo_id}`, res);
    }
  );

  handleRoute(
    "get",
    addRoutePrefix("/logos/privative/loyalty/:logo_id"),
    (req, res) => {
      sendFile(
        `assets/imgs/logos/privative/loyalty/${req.params.logo_id}`,
        res
      );
    }
  );

  handleRoute(
    "get",
    addRoutePrefix("/municipalities/:a/:b/:code"),
    (_, res) => {
      // return always the same municipality
      res.json(municipality);
    }
  );

  // get the list of all available bonus types
  handleRoute(
    "get",
    addRoutePrefix("/bonus/vacanze/bonuses_available.json"),
    (_, res) =>
      res.json(
        readFileAsJSON(
          assetsFolder + "/bonus_available/bonus_available_legacy.json"
        )
      )
  );

  handleRoute("get", addRoutePrefix("/bonus/bonus_available.json"), (_, res) =>
    res.json(
      readFileAsJSON(assetsFolder + "/bonus_available/bonus_available.json")
    )
  );

  handleRoute(
    "get",
    addRoutePrefix("/bonus/bonus_available_v1.json"),
    (_, res) =>
      res.json(
        readFileAsJSON(
          assetsFolder + "/bonus_available/bonus_available_v1.json"
        )
      )
  );

  handleRoute(
    "get",
    addRoutePrefix("/bonus/bonus_available_v2.json"),
    (_, res) =>
      res.json(
        readFileAsJSON(
          assetsFolder + "/bonus_available/bonus_available_v2.json"
        )
      )
  );

  handleRoute("get", addRoutePrefix("/contextualhelp/data.json"), (_, res) =>
    res.json(readFileAsJSON(assetsFolder + "/contextual_help/data.json"))
  );

  handleRoute("get", addRoutePrefix("/status/abi.json"), (_, res) => {
    res.json(readFileAsJSON(assetsFolder + "/data/abi.json"));
  });

  handleRoute(
    "get",
    addRoutePrefix("/status/cobadgeServices.json"),
    (req, res) => {
      const decoded = CoBadgeServices.decode(
        readFileAsJSON(assetsFolder + "/data/cobadgeServices.json")
      );
      if (E.isLeft(decoded)) {
        res.status(500).send(readableReport(decoded.value));
        return;
      }
      res.json(decoded.value);
    }
  );

  handleRoute(
    "get",
    addRoutePrefix("/status/privativeServices.json"),
    (req, res) => {
      const decoded = PrivativeServices.decode(
        readFileAsJSON(assetsFolder + "/data/privativeServices.json")
      );
      if (E.isLeft(decoded)) {
        res.status(500).send(readableReport(decoded.value));
        return;
      }
      res.json(decoded.value);
    }
  );

  handleRoute("get", addRoutePrefix("/spid/idps/list.json"), (_, res) =>
    res.json(readFileAsJSON(assetsFolder + "/spid/idps/list.json"))
  );

  handleRoute(
    "get",
    addRoutePrefix("/logos/spid/idps/:spid_logo"),
    (req, res) => {
      sendFile(`assets/imgs/logos/spid/${req.params.spid_logo}`, res);
    }
  );

  handleRoute(
    "get",
    addRoutePrefix("/assistanceTools/zendesk.json"),
    (req, res) => {
      const content = readFileAsJSON(
        assetsFolder + "/assistanceTools/zendesk.json"
      );
      const zendeskPayload = validatePayload(Zendesk, content);
      res.json(zendeskPayload);
    }
  );
};
