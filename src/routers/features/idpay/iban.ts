import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getIbanResponse } from "../../../payloads/features/idpay/iban/get-iban";
import { getIbanListResponse } from "../../../payloads/features/idpay/iban/get-iban-list";
import { addIdPayHandler } from "./router";

addIdPayHandler("get", "/iban", (_, res) =>
  res.status(200).json(getIbanListResponse())
);

addIdPayHandler("get", "/iban/:iban", (req, res) =>
  pipe(
    O.fromNullable(req.params.iban),
    O.chain(getIbanResponse),
    O.fold(
      () => res.sendStatus(404),
      iban => res.status(200).json(iban)
    )
  )
);
