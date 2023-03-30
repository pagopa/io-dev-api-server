import { Router } from "express";
import * as O from "fp-ts/lib/Option";
import { addApiV1Prefix } from "../../../utils/strings";
import { getIbanResponse } from "../../../payloads/features/idpay/get-iban";
import { addHandler } from "../../../payloads/response";
import { pipe } from "fp-ts/lib/function";
import { getIbanListResponse } from "../../../payloads/features/idpay/get-iban-list";

export const idpayRouter = Router();

export const addFciPrefix = (path: string) => addApiV1Prefix(`/idpay${path}`);

addHandler(idpayRouter, "get", addFciPrefix("/iban/:iban"), (req, res) =>
  pipe(
    O.fromNullable(req.params.iban),
    O.chain(iban =>
      iban === "IT60X0542811101000000123456" ? O.some(iban) : O.none
    ),
    O.fold(
      () => res.sendStatus(400),
      _ => res.status(200).json(getIbanResponse)
    )
  )
);

addHandler(idpayRouter, "get", addFciPrefix("/iban"), (req, res) =>
  res.status(200).json(getIbanListResponse)
);
