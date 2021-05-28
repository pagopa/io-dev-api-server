import { Router } from "express";
import * as t from "io-ts";
import { Certificate } from "../../../../generated/definitions/eu_covid_cert/Certificate";
import { RevokedCertificate } from "../../../../generated/definitions/eu_covid_cert/RevokedCertificate";
import { ValidCertificate } from "../../../../generated/definitions/eu_covid_cert/ValidCertificate";
import { assetsFolder } from "../../../global";
import { addHandler } from "../../../payloads/response";
import { readFileAsJSON } from "../../../utils/file";
import { addApiV1Prefix } from "../../../utils/strings";

export const euCovidCertRouter = Router();
const addPrefix = (path: string) => addApiV1Prefix(`/eucovidcert${path}`);

const validCertificate: Certificate = ValidCertificate.decode(
  readFileAsJSON(assetsFolder + "/eu_covid_cert/valid.json")
).value as ValidCertificate;
const revokedCertificate: Certificate = RevokedCertificate.decode(
  readFileAsJSON(assetsFolder + "/eu_covid_cert/revoked.json")
).value as RevokedCertificate;

/* use this config to setup the API response */
const responseConfig = {
  returnStatus: 200,
  payload200: revokedCertificate,
  isAuthenticated: true
};

/**
 * '200': A Certificate exists and it's found for the given access data. It is retrieved regardless of it's expired or its current status
 * '400': Payload has bad format
 * '401': Bearer token null or expired
 * '403': Access data provided are invalid or no Certificate has been emitted for the given Citizen
 * '410': Endpoint no longer avaible
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
