import { Router } from "express";
import { Iban } from "../../../../generated/definitions/backend/Iban";
import { CitizenResource } from "../../../../generated/definitions/bpd/citizen/CitizenResource";
import { fiscalCode } from "../../../global";
import { installCustomHandler } from "../../../payloads/response";
import { sendFile } from "../../../utils/file";

export const bpd = Router();

const addPrefix = (path: string) => `/bonus/bpd${path}`;
const citizen: CitizenResource = {
  enabled: false,
  fiscalCode,
  payoffInstr: "",
  payoffInstrType: "IBAN",
  timestampTC: new Date()
};

// tslint:disable-next-line: no-let
let currentCitizen: CitizenResource | undefined;

// return the T&C as a HTML string
installCustomHandler(bpd, "get", addPrefix("/tc/html"), (_, res) =>
  res.status(200).send("<html><body>hello HTML</body></html>")
);

// return the T&C as a pdf file
installCustomHandler(bpd, "get", addPrefix("/tc/pdf"), (_, res) =>
  sendFile("assets/pdf/tos.pdf", res)
);

// return the citizen json swagger file
installCustomHandler(bpd, "get", addPrefix("/definition/citizen"), (_, res) =>
  sendFile("assets/definitions/bonus/bpd/citizen.json", res)
);

/**
 * return the citizen
 * can return these codes: 200, 401, 404, 500
 * see https://bpd-dev.portal.azure-api.net/docs/services/bpd-ms-citizen/export?DocumentFormat=Swagger
 */
installCustomHandler(bpd, "get", addPrefix("/io/citizen"), (_, res) => {
  if (currentCitizen === undefined) {
    res.sendStatus(404);
  }
  res.json(currentCitizen);
});

/**
 * update the citizen
 * can return these codes: 200, 401, 500
 * see https://bpd-dev.portal.azure-api.net/docs/services/bpd-ms-citizen/export?DocumentFormat=Swagger
 */
installCustomHandler(bpd, "put", addPrefix("/io/citizen"), (_, res) => {
  currentCitizen = {
    ...citizen,
    enabled: true
  };
  res.json(currentCitizen);
});

/**
 * patch the citizen
 * can return these codes:
 * - 200 -> ok
 * - 401 -> Unauthorized
 * - 400 -> IBAN not valid
 * - 500 -> GENERIC_ERROR
 * see https://bpd-dev.portal.azure-api.net/docs/services/bpd-ms-citizen/export?DocumentFormat=Swagger
 * see https://docs.google.com/document/d/1GuFOu24IeWK3W4pGlZ8PUnnMJi-oDr5xAQEjTxC0hfc/edit#heading=h.gr9fx7vug165
 */
installCustomHandler(bpd, "patch", addPrefix("/io/citizen"), (req, res) => {
  // citizen not found
  if (currentCitizen === undefined) {
    res.sendStatus(404);
    return;
  }
  const { payoffInstr, payoffInstrType } = req.body;
  if (Iban.decode(payoffInstr).isLeft()) {
    // should invalidate citizen current iban ?
    res.sendStatus(400);
    return;
  }
  currentCitizen = {
    ...currentCitizen,
    payoffInstr,
    payoffInstrType
  };

  // possible values
  // OK -> citizen owns the given IBAN
  // KO -> citizen doesn't own the given IBAN
  // UNKNOWN_PSP -> can't verify the given IBAN
  const validationStatus = "OK";
  res.json({ validationStatus });
});

export const resetBpd = () => {
  currentCitizen = undefined;
};
