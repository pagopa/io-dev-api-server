import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { addIdPayHandler } from "./router";


/**
 * Pre Authorize payment
 */
addIdPayHandler("put", "payment/qr-code/:trxCode/relate-user", (req, res) =>
  pipe(
    req.params.trxCode,
    O.fromNullable,
    O.fold(
      () => res.status(403).json(getIdPayError(403)),
      () => res.sendStatus(200)
    )
  )
);

/**
 *  Authorize payment
 */
addIdPayHandler("put", "payment/qr-code/:trxCode/authorize", (req, res) =>
  pipe(
    req.params.trxCode,
    O.fromNullable,
    O.fold(
      () => res.status(403).json(getIdPayError(403)),
      () => res.sendStatus(200)
    )
  )
);
