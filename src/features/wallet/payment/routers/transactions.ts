import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { ulid } from "ulid";
import { NewTransactionRequest } from "../../../../../generated/definitions/pagopa/ecommerce/NewTransactionRequest";
import { RequestAuthorizationRequest } from "../../../../../generated/definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { RequestAuthorizationResponse } from "../../../../../generated/definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { serverUrl } from "../../../../utils/server";
import {
  createTransaction,
  deleteTransaction,
  getTransaction
} from "../persistence/transactions";
import { addPaymentHandler } from "./router";

addPaymentHandler("post", "/transactions", (req, res) =>
  pipe(
    NewTransactionRequest.decode(req.body),
    O.fromEither,
    O.fold(
      () => res.sendStatus(403),
      flow(
        ({ paymentNotices }) => paymentNotices,
        createTransaction,
        res.status(200).json
      )
    )
  )
);

addPaymentHandler("get", "/transactions/:transactionId", (req, res) =>
  pipe(
    req.params.transactionId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(403),
      flow(
        getTransaction,
        O.fold(() => res.sendStatus(404), res.status(200).json)
      )
    )
  )
);

addPaymentHandler("delete", "/transactions/:transactionId", (req, res) =>
  pipe(
    req.params.transactionId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(403),
      flow(
        getTransaction,
        O.fold(
          () => res.sendStatus(404),
          ({ transactionId }) => {
            deleteTransaction(transactionId);
            return res.status(202).json();
          }
        )
      )
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
        transactionId: pipe(req.params.transactionId, O.fromNullable)
      }),
      O.fold(
        () => res.sendStatus(403),
        ({ transactionId }) =>
          pipe(
            getTransaction(transactionId),
            O.fold(
              () => res.sendStatus(404),
              () =>
                res.status(200).json({
                  authorizationUrl: `${serverUrl}`,
                  authorizationRequestId: ulid()
                } as RequestAuthorizationResponse)
            )
          )
      )
    )
);
