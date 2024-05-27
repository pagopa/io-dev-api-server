/**
 * this router serves all data and assets provided by io-services-metadata https://github.com/pagopa/io-services-metadata
 */
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import * as B from "fp-ts/lib/boolean";
import { pipe } from "fp-ts/lib/function";
import { SpidIdps } from "../../generated/definitions/content/SpidIdps";
import { VersionInfo } from "../../generated/definitions/content/VersionInfo";
import { Zendesk } from "../../generated/definitions/content/Zendesk";
import { CoBadgeServices } from "../../generated/definitions/pagopa/cobadge/configuration/CoBadgeServices";
import { PrivativeServices } from "../../generated/definitions/pagopa/privative/configuration/PrivativeServices";
import { assetsFolder, staticContentRootPath } from "../config";
import { backendStatus } from "../payloads/backend";
import { municipality } from "../payloads/municipality";
import { addHandler } from "../payloads/response";
import {
  fileExists,
  isPngOrJpegExtension,
  listDir,
  readFileAndDecode,
  readFileAsJSON,
  sendFileFromRootPath
} from "../utils/file";
import { serverUrl } from "../utils/server";
import { validatePayload } from "../utils/validator";
import { ServiceId } from "../../generated/definitions/backend/ServiceId";
import { pnServiceId } from "../features/pn/services/services";
import { cgnServiceId } from "../payloads/services/special/cgn/factoryCGNService";
import ServicesDB from "./../persistence/services";

export const servicesMetadataRouter = Router();

const addRoutePrefix = (path: string) => `${staticContentRootPath}${path}`;

const serviceLogoBaseRelativePathGenerator = () =>
  "assets/imgs/logos/services/";
const fallbackServiceLogoRelativePathGenerator = () =>
  `${serviceLogoBaseRelativePathGenerator()}service_00.png`;

const organizationLogoBaseRelativePathGenerator = () =>
  "assets/imgs/logos/organizations/";
const fallbackOrganizationLogoRelativePathGenerator = () =>
  `${organizationLogoBaseRelativePathGenerator()}organization_00.png`;
const serviceLogoMap = new Map<string, string>();
const organizationLogoMap = new Map<string, string>();

export const initializeServiceLogoMap = () => {
  serviceLogoMap.set(
    `${pnServiceId.toLowerCase()}.png`,
    `${serviceLogoBaseRelativePathGenerator()}specialServices/service_send.png`
  );
  serviceLogoMap.set(
    `${cgnServiceId.toLowerCase()}.png`,
    `${serviceLogoBaseRelativePathGenerator()}specialServices/service_cgn.png`
  );
};

/**
 * @deprecated the app should not use this API. It should consume metadata contained in the service detail
 */
addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix(`/services/:service_id`),
  (req, res) => {
    const serviceId = req.params.service_id.split(".")[0] as ServiceId;
    const service = ServicesDB.getService(serviceId);
    if (service === undefined || service.service_metadata === undefined) {
      res.sendStatus(404);
      return;
    }
    const serviceMetadata = service.service_metadata;
    res.json(serviceMetadata);
  }
);

// backend service status
addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/status/backend.json"),
  (_, res) => res.json(backendStatus)
);

// Metadata related to the app version
addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/status/versionInfo.json"),
  (_, res) =>
    readFileAndDecode("assets/status/versionInfo.json", VersionInfo.decode, res)
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/organizations/:fileNameWithExtension"),
  (req, res) =>
    pipe(req.params.fileNameWithExtension, fileNameWithExtension =>
      pipe(
        fileNameWithExtension === "4.png",
        B.fold(
          () =>
            pipe(
              getOrLoadAndInitializeLogoRelativePath(
                fileNameWithExtension,
                organizationLogoMap,
                organizationLogoBaseRelativePathGenerator(),
                fallbackOrganizationLogoRelativePathGenerator
              ),
              organizationLogoRelativePath =>
                sendFileFromRootPath(organizationLogoRelativePath, res)
            ),
          // we send a 404 for the service number 4 to check missing image values
          () => res.sendStatus(404)
        )
      )
    )
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/services/:fileNameWithExtension"),
  (req, res) => {
    const fileNameWithExtension = req.params.fileNameWithExtension;
    const serviceLogoRelativePath = getOrLoadAndInitializeLogoRelativePath(
      fileNameWithExtension,
      serviceLogoMap,
      serviceLogoBaseRelativePathGenerator(),
      fallbackServiceLogoRelativePathGenerator
    );
    sendFileFromRootPath(serviceLogoRelativePath, res);
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/abi/:logo_id"),
  (req, res) => {
    sendFileFromRootPath(`assets/imgs/logos/abi/${req.params.logo_id}`, res);
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/privative/gdo/:logo_id"),
  (req, res) => {
    sendFileFromRootPath(
      `assets/imgs/logos/privative/gdo/${req.params.logo_id}`,
      res
    );
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/privative/loyalty/:logo_id"),
  (req, res) => {
    sendFileFromRootPath(
      `assets/imgs/logos/privative/loyalty/${req.params.logo_id}`,
      res
    );
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
    if (E.isLeft(decoded)) {
      res.status(500).send(readableReport(decoded.left));
      return;
    }
    res.json(decoded.right);
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/status/privativeServices.json"),
  (req, res) => {
    const decoded = PrivativeServices.decode(
      readFileAsJSON(assetsFolder + "/data/privativeServices.json")
    );
    if (E.isLeft(decoded)) {
      res.status(500).send(readableReport(decoded.left));
      return;
    }
    res.json(decoded.right);
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/spid/idps/list.json"),
  (_, res) => {
    pipe(
      SpidIdps.decode(readFileAsJSON(assetsFolder + "/spid/idps/list.json")),
      E.fold(
        e => {
          res.status(500).send(readableReport(e));
        },
        idps => {
          // set the logo url as server local resource
          const idpsWithLogo = idps.items.map(idp => {
            const urlSegments = idp.logo.split("/");
            const logoImageName = urlSegments[urlSegments.length - 1];
            return {
              ...idp,
              logo: `${serverUrl}${staticContentRootPath}/logos/spid/idps/${logoImageName}`
            };
          });
          res.json({ ...idps, items: idpsWithLogo });
        }
      )
    );
  }
);

addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/logos/spid/idps/:spid_logo"),
  (req, res) => {
    const logoPath = `assets/spid/idps/${req.params.spid_logo}`;
    if (fileExists(logoPath)) {
      sendFileFromRootPath(logoPath, res);
      return;
    }
    res.sendStatus(404);
  }
);
addHandler(
  servicesMetadataRouter,
  "get",
  addRoutePrefix("/assistanceTools/zendesk.json"),
  (_, res) => {
    const content = readFileAsJSON(
      assetsFolder + "/assistanceTools/zendesk.json"
    );
    const zendeskPayload = validatePayload(Zendesk, content);
    res.json(zendeskPayload);
  }
);

const getOrLoadAndInitializeLogoRelativePath = (
  fileNameWithExtension: string,
  map: Map<string, string>,
  sourceDirRelativePath: string,
  fallbackRelativePathFunction: () => string
) => {
  const lowercaseFileNameWithExtension = fileNameWithExtension.toLowerCase();
  if (!map.has(lowercaseFileNameWithExtension)) {
    const fileNames = listDir(sourceDirRelativePath);
    const pngOrJpegOnlyFileNames = fileNames.filter(isPngOrJpegExtension);
    if (pngOrJpegOnlyFileNames.length > 0) {
      const pngOrJpegRandomIndex = Math.ceil(
        (pngOrJpegOnlyFileNames.length - 1) * Math.random()
      );
      const pngOrJpegFileName = pngOrJpegOnlyFileNames[pngOrJpegRandomIndex];
      const pngOrJpegRelativePath = `${sourceDirRelativePath}${pngOrJpegFileName}`;
      map.set(lowercaseFileNameWithExtension, pngOrJpegRelativePath);
    }
  }

  return (
    map.get(lowercaseFileNameWithExtension) ?? fallbackRelativePathFunction()
  );
};
