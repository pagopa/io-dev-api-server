import { Router } from "express";
import * as t from "io-ts";
import { Certificate } from "../../../../generated/definitions/eu_covid_cert/Certificate";
import { assetsFolder } from "../../../global";
import { addHandler } from "../../../payloads/response";
import { readFileAsJSON } from "../../../utils/file";
import { addApiV1Prefix } from "../../../utils/strings";
import { validatePayload } from "../../../utils/validator";

export const euCovidCertRouter = Router();
const addPrefix = (path: string) => addApiV1Prefix(`/eucovidcert${path}`);

const validCertificate = readFileAsJSON(
  assetsFolder + "/eu_covid_cert/valid.json"
);

const revokedCertificate = readFileAsJSON(
  assetsFolder + "/eu_covid_cert/revoked.json"
);

// an error will be throw if these payloads don't respect that type
validatePayload(Certificate, validCertificate);
validatePayload(Certificate, revokedCertificate);
/* use this config to setup the API response */
const responseConfig = {
  returnStatus: 200,
  payload200: validCertificate,
  isAuthenticated: true
};

/**
 * '200': A Certificate exists and it's found for the given access data. It is retrieved regardless of it's expired or its current status
 * '400': Payload has bad format
 * '401': Bearer token null or expired
 * '403': Access data provided are invalid or no Certificate has been emitted for the given Citizen
 * '410': Endpoint no longer available
 * '500': Generic server error
 * '504': Gateway Timeout
 */
addHandler(euCovidCertRouter, "post", addPrefix("/certificate"), (req, res) => {
  if (!responseConfig.isAuthenticated) {
    // Bearer token null or expired
    res.sendStatus(401);
    return;
  }
  if (responseConfig.returnStatus !== 200) {
    res.sendStatus(responseConfig.returnStatus);
    return;
  }
  const { auth_code } = req.body;
  if (t.string.decode(auth_code).isLeft()) {
    // Payload has bad format
    res.sendStatus(400);
    return;
  }
  res.json(responseConfig.payload200);
});
