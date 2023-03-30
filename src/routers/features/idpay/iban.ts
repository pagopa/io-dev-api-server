import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getIbanResponse } from "../../../payloads/features/idpay/iban/get-iban";
import { getIbanListResponse } from "../../../payloads/features/idpay/iban/get-iban-list";
import { addIdPayHandler } from "./router";

addIdPayHandler("get", "/iban/:iban", (req, res) =>
  pipe(
    O.fromNullable(req.params.iban),
    O.chain(iban =>
      getIbanListResponse.ibanList.some(i => i.iban === iban)
        ? O.some(iban)
        : O.none
    ),
    O.fold(
      () => res.sendStatus(400),
      iban =>
        res
          .status(200)
          .json(getIbanListResponse.ibanList.find(i => i.iban === iban))
    )
  )
);

addIdPayHandler("get", "/iban", (req, res) =>
  res.status(200).json(getIbanListResponse)
);
