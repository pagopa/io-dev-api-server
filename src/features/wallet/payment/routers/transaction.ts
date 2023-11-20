import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { ulid } from "ulid";
import { NewTransactionRequest } from "../../../../../generated/definitions/pagopa/ecommerce/NewTransactionRequest";
import { RequestAuthorizationRequest } from "../../../../../generated/definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { RequestAuthorizationResponse } from "../../../../../generated/definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { serverUrl } from "../../../../utils/server";
import {
  getNewTransactionResponsePayload,
  getTransactionInfoPayload
} from "../payloads/transactions";
import { WALLET_PAYMENT_PATH } from "../utils/path";
import { addPaymentHandler } from "./router";

addPaymentHandler("post", "/transactions", (req, res) =>
  pipe(
    NewTransactionRequest.decode(req.body),
    O.fromEither,
    O.fold(
      () => res.sendStatus(400),
      ({ paymentNotices }) =>
        pipe(
          paymentNotices,
          getNewTransactionResponsePayload,
          O.fold(
            () => res.sendStatus(404),
            transaction => res.status(200).json(transaction)
          )
        )
    )
  )
);

addPaymentHandler("get", "/transactions/:transactionId", (req, res) =>
  pipe(
    req.params.transactionId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(400),
      flow(
        getTransactionInfoPayload,
        O.fold(
          () => res.sendStatus(404),
          transaction => res.status(200).json(transaction)
        )
      )
    )
  )
);

addPaymentHandler("delete", "/transactions/:transactionId", (req, res) =>
  pipe(
    req.params.transactionId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(400),
      () => res.sendStatus(200)
    )
  )
);

addPaymentHandler(
  "post",
  "/transactions/:transactionId/auth-requests",
  (req, res) =>
    pipe(
      sequenceS(O.Monad)({
        requestAuthorization: pipe(
          RequestAuthorizationRequest.decode(req.body),
          O.fromEither
        ),
        transactionId: O.fromNullable(req.params.transactionId)
      }),
      O.fold(
        () => res.sendStatus(403),
        ({ transactionId }) =>
          pipe(
            getTransactionInfoPayload(transactionId),
            O.fold(
              () => res.sendStatus(404),
              () =>
                res.status(200).json({
                  authorizationUrl: `${serverUrl}${WALLET_PAYMENT_PATH}`,
                  authorizationRequestId: ulid()
                } as RequestAuthorizationResponse)
            )
          )
      )
    )
);
