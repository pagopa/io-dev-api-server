import * as O from "fp-ts/lib/Option";

import { pipe } from "fp-ts/lib/function";
import { TransactionBarCodeRequest } from "../../../../generated/definitions/idpay/TransactionBarCodeRequest";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { getWalletDetailResponse } from "../../../payloads/features/idpay/get-wallet-detail";
import { getIdPayBarcodeTransaction } from "../../../persistence/idpay";
import { addIdPayHandler } from "./router";

addIdPayHandler("post", "/payment/bar-code", (req, res) =>
  pipe(
    TransactionBarCodeRequest.decode(req.body),
    O.fromEither,
    O.map(data => data.initiativeId),
    O.fold(
      () => res.status(400).json(getIdPayError(400)),
      initiativeId =>
        pipe(
          getWalletDetailResponse(initiativeId),
          O.fold(
            () => res.status(404).json(getIdPayError(404)),
            () => {
              const barcodeTransaction = getIdPayBarcodeTransaction(
                initiativeId,
                2
              );
              return res.status(201).json(barcodeTransaction);
            }
          )
        )
    )
  )
);
