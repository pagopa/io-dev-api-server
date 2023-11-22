import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { ulid } from "ulid";
import { CalculateFeeRequest } from "../../../../../generated/definitions/pagopa/ecommerce/CalculateFeeRequest";
import { NewTransactionRequest } from "../../../../../generated/definitions/pagopa/ecommerce/NewTransactionRequest";
import { RequestAuthorizationRequest } from "../../../../../generated/definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { RequestAuthorizationResponse } from "../../../../../generated/definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { RptId } from "../../../../../generated/definitions/pagopa/ecommerce/RptId";
import { serverUrl } from "../../../../utils/server";
import { getPaymentRequestsGetResponse } from "../payloads/payments";
import {
  getCalculateFeeResponsePayload,
  getNewTransactionResponsePayload,
  getTransactionInfoPayload
} from "../payloads/transactions";
import { WALLET_PAYMENT_PATH } from "../utils/path";
import { addPaymentHandler } from "./router";
export { paymentRouter } from "./router";

// Verify single payment notices
addPaymentHandler("get", "/payment-requests/:rpt_id", (req, res) =>
  pipe(
    RptId.decode(req.params.rpt_id),
    O.fromEither,
    O.fold(
      () => res.sendStatus(400),
      flow(
        getPaymentRequestsGetResponse,
        O.fold(
          () => res.sendStatus(404),
          response => res.status(200).json(response)
        )
      )
    )
  )
);

// Create new transaction
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

// Get transaction information
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

// Performs the transaction cancellation
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

// Calculatefees for given wallet id and amount
addPaymentHandler("get", "/payment-methods/:paymentId/fees", (req, res) =>
  pipe(
    sequenceS(O.Monad)({
      calculateFeeRequest: pipe(
        CalculateFeeRequest.decode(req.body),
        O.fromEither
      ),
      paymentId: O.fromNullable(req.params.paymentId)
    }),
    O.fold(
      () => res.sendStatus(400),
      ({ calculateFeeRequest }) =>
        pipe(
          getCalculateFeeResponsePayload(
            calculateFeeRequest.walletId,
            calculateFeeRequest.paymentAmount
          ),
          O.fold(
            () => res.sendStatus(404),
            fees => res.status(200).json(fees)
          )
        )
    )
  )
);

// Create a new request authorization given a transaction
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
