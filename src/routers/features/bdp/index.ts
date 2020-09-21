import { Router } from "express";
import * as faker from "faker/locale/it";
import { fiscalCode } from "../../../global";
import { installCustomHandler } from "../../../payloads/response";
import { sendFile } from "../../../utils/file";

export const bdp = Router();

const addPrefix = (path: string) => `/bonus/bpd${path}`;
const iban = faker.finance.iban(false);
const citizen = {
  enabled: false,
  fiscalCode,
  payoffInstr: iban,
  payoffInstrType: "IBAN",
  timestampTC: new Date().toISOString()
};

// tslint:disable-next-line: no-let
let currentCitizen = { ...citizen };

// return the T&C as a HTML string
installCustomHandler(bdp, "get", addPrefix("/tc/html"), (_, res) =>
  res.status(200).send("<html><body>hello HTML</body></html>")
);

// return the T&C as a pdf file
installCustomHandler(bdp, "get", addPrefix("/tc/pdf"), (_, res) =>
  sendFile("assets/pdf/tos.pdf", res)
);

// return the citizen json swagger file
installCustomHandler(bdp, "get", addPrefix("/definition/citizen"), (_, res) =>
  sendFile("assets/definitions/bonus/bdp/citizen.json", res)
);

/**
 * return the citizen
 * can return these codes: 200, 401, 404, 500
 * see https://bpd-dev.portal.azure-api.net/docs/services/bpd-ms-citizen/export?DocumentFormat=Swagger
 */
installCustomHandler(bdp, "get", addPrefix("/io/citizen"), (_, res) =>
  res.json(currentCitizen)
);

/**
 * update the citizen
 * can return these codes: 200, 401, 500
 * see https://bpd-dev.portal.azure-api.net/docs/services/bpd-ms-citizen/export?DocumentFormat=Swagger
 */
installCustomHandler(bdp, "put", addPrefix("/io/citizen"), (_, res) => {
  currentCitizen = {
    ...currentCitizen,
    enabled: true
  };
  res.json(citizen);
});

export const resetBpd = () => {
  currentCitizen = citizen;
};
