import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { putAuthPaymentResponse } from "../../../payloads/features/idpay/put-auth-payment";
import { putPreAuthPaymentResponse } from "../../../payloads/features/idpay/put-pre-auth-payment";
import { addIdPayHandler } from "./router";

/**
 * Pre Authorize payment
 */
addIdPayHandler("put", "/payment/qr-code/:trxCode/relate-user", (req, res) =>
  pipe(
    req.params.trxCode,
    O.fromNullable,
    O.chain(putPreAuthPaymentResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      data => res.status(200).json(data)
    )
  )
);

/**
 *  Authorize payment
 */
addIdPayHandler("put", "/payment/qr-code/:trxCode/authorize", (req, res) =>
  pipe(
    req.params.trxCode,
    O.fromNullable,
    O.chain(putAuthPaymentResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      data => res.status(200).json(data)
    )
  )
);
