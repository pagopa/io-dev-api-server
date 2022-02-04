import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { enumType } from "italia-ts-commons/lib/types";
import { Iban } from "../../../../generated/definitions/backend/Iban";
import {
  CitizenResource as CitizenResourceV2,
  OptInStatusEnum
} from "../../../../generated/definitions/bpd/citizen-v2/CitizenResource";
import { PaymentInstrumentDTO } from "../../../../generated/definitions/bpd/payment/PaymentInstrumentDTO";
import {
  PaymentInstrumentResource,
  StatusEnum
} from "../../../../generated/definitions/bpd/payment/PaymentInstrumentResource";
import { assetsFolder, ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { readFileAsJSON } from "../../../utils/file";

export const bpd = Router();

export const addBPDPrefix = (path: string) => `/bonus/bpd${path}`;

export const citizenV2: CitizenResourceV2 = {
  enabled: false,
  fiscalCode: ioDevServerConfig.profile.attrs.fiscal_code,
  payoffInstr: "",
  payoffInstrType: "IBAN",
  timestampTC: new Date(),
  optInStatus: OptInStatusEnum.NOREQ
};

// tslint:disable-next-line: no-let
let currentCitizenV2: CitizenResourceV2 | undefined;

/**
 * return the citizen
 * can return these codes: 200, 401, 404, 500
 * see https://bpd-dev.portal.azure-api.net/docs/services/bpd-ms-citizen/export?DocumentFormat=Swagger
 * TODO: remove GET '/io/citizen' when technical account and remove tslint:disable to GET '/io/citizen/v2'
 */
addHandler(bpd, "get", addBPDPrefix("/io/citizen"), (_, res) => {
  if (currentCitizenV2 === undefined) {
    res.sendStatus(404);
    return;
  }
  res.json(currentCitizenV2);
});
// tslint:disable-next-line:no-identical-functions
addHandler(bpd, "get", addBPDPrefix("/io/citizen/v2"), (_, res) => {
  if (currentCitizenV2 === undefined) {
    res.sendStatus(404);
    return;
  }
  res.json(currentCitizenV2);
});

addHandler(bpd, "delete", addBPDPrefix("/io/citizen"), (_, res) => {
  if (currentCitizenV2 === undefined) {
    res.sendStatus(404);
    return;
  }
  currentCitizenV2 = undefined;
  res.sendStatus(204);
});

/**
 * update the citizen
 * can return these codes: 200, 401, 500
 * see https://bpd-dev.portal.azure-api.net/docs/services/bpd-ms-citizen/export?DocumentFormat=Swagger
 * TODO: remove PUT '/io/citizen' when technical account and remove tslint:disable to PUT '/io/citizen/v2'
 */
addHandler(bpd, "put", addBPDPrefix("/io/citizen"), (_, res) => {
  currentCitizenV2 = {
    ...citizenV2,
    enabled: true
  };
  res.json(currentCitizenV2);
});

addHandler(bpd, "put", addBPDPrefix("/io/citizen/v2"), (req, res) => {
  if (req.body.optInStatus) {
    pipe(
      enumType<OptInStatusEnum>(OptInStatusEnum, "optInStatus").decode(
        req.body.optInStatus
      ),
      E.fold(
        () => {
          res.sendStatus(400);
        },
        optIn => {
          // if the citizen is not enrolled, the updating of optInStatus is a bad request
          if (!(currentCitizenV2?.enabled ?? false)) {
            res.sendStatus(400);
            return;
          }
          res.json({
            ...citizenV2,
            optInStatus: optIn
          });
        }
      )
    );
    return;
  }
  res.json({
    ...citizenV2,
    enabled: true
  });
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
  if (currentCitizenV2 === undefined) {
    res.sendStatus(404);
    return;
  }
  const { payoffInstr, payoffInstrType } = req.body;
  if (E.isLeft(Iban.decode(payoffInstr))) {
    // should invalidate citizen current iban ?
    res.sendStatus(400);
    return;
  }
  currentCitizenV2 = {
    ...currentCitizenV2,
    payoffInstr,
    payoffInstrType,
    technicalAccount: undefined
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
      readFileAsJSON(
        assetsFolder + "/bpd/payment-instruments/number/default.json"
      )
    )
);

const activeHashPan: Map<string, StatusEnum> = new Map<string, StatusEnum>();

// get info about the given payment instrument
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
      fiscalCode: ioDevServerConfig.profile.attrs.fiscal_code,
      activationDate: new Date().toISOString(),
      deactivationDate: new Date().toISOString(),
      Status: status!
    };
    res.json(result);
  }
);

// active the given payment instrument to the BPD program
addHandler(
  bpd,
  "put",
  addBPDPrefix("/io/payment-instruments/:hashPan"),
  (req, res) => {
    const hpan = req.params.hashPan;
    activeHashPan.set(hpan, StatusEnum.ACTIVE);
    const result: PaymentInstrumentDTO = {
      fiscalCode: ioDevServerConfig.profile.attrs.fiscal_code,
      activationDate: new Date()
    };
    res.json(result);
  }
);

// remove the given payment instrument from the BPD program
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
  currentCitizenV2 = undefined;
  activeHashPan.clear();
};
