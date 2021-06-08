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
const expiredCertificate = readFileAsJSON(
  assetsFolder + "/eu_covid_cert/expired.json"
);

// an error will be throw if these payloads don't respect that type
validatePayload(Certificate, validCertificate);
validatePayload(Certificate, revokedCertificate);
validatePayload(Certificate, expiredCertificate);

/**
 * authCode
 * description
 * status code
 * response payload
 */
export const authResponses: ReadonlyArray<readonly [
  string,
  string,
  number,
  Certificate | undefined
]> = [
  ["auth8", "gateway timeout", 504, undefined],
  ["auth7", "generic error", 500, undefined],
  ["auth6", "endpoint no longer valid", 410, undefined],
  ["auth5", "no certificate", 403, undefined],
  ["auth4", "bad format", 400, undefined],
  ["auth3", "expired", 200, expiredCertificate],
  ["auth2", "revoked", 200, revokedCertificate],
  ["auth1", "valid", 200, validCertificate]
];
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
  const { auth_code } = req.body;
  const config = authResponses.find(i => i[0] === auth_code);
  if (t.string.decode(auth_code).isLeft() || config === undefined) {
    // Payload has bad format
    res.sendStatus(400);
    return;
  }
  if (config[3]) {
    res.json(config[3]);
    return;
  }
  res.sendStatus(config[2]);
});
