import { Router } from "express";
import { Iban } from "../../../../generated/definitions/backend/Iban";
import { CitizenResource } from "../../../../generated/definitions/bpd/citizen/CitizenResource";
import { PaymentInstrumentDTO } from "../../../../generated/definitions/bpd/payment/PaymentInstrumentDTO";
import {
  PaymentInstrumentResource,
  StatusEnum
} from "../../../../generated/definitions/bpd/payment/PaymentInstrumentResource";
import { assetsFolder, fiscalCode } from "../../../global";
import { addHandler } from "../../../payloads/response";
import { readFile } from "../../../utils/file";

export const bpd = Router();

export const addBPDPrefix = (path: string) => `/bonus/bpd${path}`;
const citizen: CitizenResource = {
  enabled: false,
  fiscalCode,
  payoffInstr: "",
  payoffInstrType: "IBAN",
  timestampTC: new Date()
};

// tslint:disable-next-line: no-let
let currentCitizen: CitizenResource | undefined;

/**
 * return the citizen
 * can return these codes: 200, 401, 404, 500
 * see https://bpd-dev.portal.azure-api.net/docs/services/bpd-ms-citizen/export?DocumentFormat=Swagger
 */
addHandler(bpd, "get", addBPDPrefix("/io/citizen"), (_, res) => {
  if (currentCitizen === undefined) {
    res.sendStatus(404);
    return;
  }
  res.json(currentCitizen);
});

addHandler(bpd, "delete", addBPDPrefix("/io/citizen"), (_, res) => {
  if (currentCitizen === undefined) {
    res.sendStatus(404);
    return;
  }
  currentCitizen = undefined;
  res.sendStatus(204);
});

/**
 * update the citizen
 * can return these codes: 200, 401, 500
 * see https://bpd-dev.portal.azure-api.net/docs/services/bpd-ms-citizen/export?DocumentFormat=Swagger
 */
addHandler(bpd, "put", addBPDPrefix("/io/citizen"), (_, res) => {
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
addHandler(bpd, "patch", addBPDPrefix("/io/citizen"), (req, res) => {
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

/*
 app-io-channel
 Nexi	32875
 Intesa San Paolo	03069
 Poste	36081
 Unicredit	02008
 Banca Sella	03268
 Nexi - UBI	03111
 Nexi - ICCREA	08000
 American Express	36019
 Satispay	STPAY
 ICCREA	12940
 Diner's	70248
 Axepta (BNP)	01005
 Bancomat	COBAN
 BancomatPay	BPAY1
 SiaPay	33604
 Paytipper
 Reiffeisen
 Cedacri
 Deutsche
 MPS
 Equens Worldline
 EVO Payments	EVODE
 Nexi - Meps	16330
 */
addHandler(
  bpd,
  "get",
  addBPDPrefix("/io/payment-instruments/number/"),
  (req, res) =>
    res.json(
      JSON.parse(
        readFile(assetsFolder + "/bpd/payment-instruments/number/default.json")
      )
    )
);

const activeHashPan: Map<string, StatusEnum> = new Map<string, StatusEnum>();

addHandler(
  bpd,
  "get",
  addBPDPrefix("/io/payment-instruments/:hashPan"),
  (req, res) => {
    const hpan = req.params.hashPan;
    if (!activeHashPan.has(hpan)) {
      res.sendStatus(404);
      return;
    }
    const status = activeHashPan.get(hpan);
    const result: PaymentInstrumentResource = {
      hpan,
      fiscalCode,
      activationDate: new Date().toISOString(),
      deactivationDate: new Date().toISOString(),
      Status: status!
    };
    res.json(result);
  }
);

addHandler(
  bpd,
  "put",
  addBPDPrefix("/io/payment-instruments/:hashPan"),
  (req, res) => {
    const hpan = req.params.hashPan;
    activeHashPan.set(hpan, StatusEnum.ACTIVE);
    const result: PaymentInstrumentDTO = {
      fiscalCode,
      activationDate: new Date()
    };
    res.json(result);
  }
);

addHandler(
  bpd,
  "delete",
  addBPDPrefix("/io/payment-instruments/:hashPan"),
  (req, res) => {
    const hpan = req.params.hashPan;
    if (!activeHashPan.has(hpan)) {
      res.sendStatus(404);
      return;
    }
    activeHashPan.set(hpan, StatusEnum.INACTIVE);
    res.sendStatus(204);
  }
);

export const resetBpd = () => {
  currentCitizen = undefined;
  activeHashPan.clear();
};
