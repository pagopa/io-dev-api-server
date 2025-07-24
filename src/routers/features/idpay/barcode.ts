import * as O from "fp-ts/lib/Option";

import { pipe } from "fp-ts/lib/function";
import { TransactionBarCodeRequest } from "../../../../generated/definitions/idpay/TransactionBarCodeRequest";
import { getWalletDetailResponse } from "../../../payloads/features/idpay/get-wallet-detail";
import { getIdPayBarcodeTransaction } from "../../../persistence/idpay";
import { CodeEnum } from "../../../../generated/definitions/idpay/PaymentInstrumentErrorDTO";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { addIdPayHandler } from "./router";

const SECONDS_TO_EXPIRE_BARCODE = 120;

addIdPayHandler("post", "/payment/bar-code", (req, res) =>
  pipe(
    TransactionBarCodeRequest.decode(req.body),
    O.fromEither,
    O.map(data => data.initiativeId),
    O.fold(
      () =>
        res
          .status(400)
          .json(getIdPayError(CodeEnum.PAYMENT_INSTRUMENT_NOT_FOUND)),
      initiativeId =>
        pipe(
          getWalletDetailResponse(initiativeId),
          O.fold(
            () =>
              res
                .status(404)
                .json(getIdPayError(CodeEnum.PAYMENT_INSTRUMENT_NOT_FOUND)),
            () => {
              const barcodeTransaction = getIdPayBarcodeTransaction(
                initiativeId,
                SECONDS_TO_EXPIRE_BARCODE
              );
              return res.status(201).json(barcodeTransaction);
            }
          )
        )
    )
  )
);
