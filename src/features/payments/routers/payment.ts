import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { ulid } from "ulid";
import { CalculateFeeRequest } from "../../../../generated/definitions/pagopa/ecommerce/CalculateFeeRequest";
import { FaultCategoryEnum } from "../../../../generated/definitions/pagopa/ecommerce/FaultCategory";
import { NewTransactionRequest } from "../../../../generated/definitions/pagopa/ecommerce/NewTransactionRequest";
import { RequestAuthorizationRequest } from "../../../../generated/definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { RequestAuthorizationResponse } from "../../../../generated/definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { RptId } from "../../../../generated/definitions/pagopa/ecommerce/RptId";
import { ioDevServerConfig } from "../../../config";
import { serverUrl } from "../../../utils/server";
import { getPaymentRequestsGetResponse } from "../payloads/payments";
import {
  getCalculateFeeResponsePayload,
  getNewTransactionResponsePayload,
  getTransactionInfoPayload
} from "../payloads/transactions";
import WalletDB from "../persistence/userWallet";
import TransactionsDB from "../persistence/transactions";
import {
  WalletPaymentFailure,
  getStatusCodeForWalletFailure
} from "../types/failure";
import { generateOnboardablePaymentMethods } from "../utils/onboarding";
import { WALLET_PAYMENT_PATH } from "../utils/payment";
import { addPaymentHandler } from "./router";

// eCommerce session token
addPaymentHandler("post", "/sessions", (req, res) =>
  res.status(200).json({ sessionToken: ulid() })
);

// Verify single payment notices
addPaymentHandler("get", "/payment-requests/:rpt_id", (req, res) =>
  pipe(
    RptId.decode(req.params.rpt_id),
    O.fromEither,
    O.fold(
      () => res.sendStatus(400),
      rptId =>
        pipe(
          ioDevServerConfig.features.wallet?.verificationFailure,
          WalletPaymentFailure.decode,
          O.fromEither,
          O.fold(
            () =>
              pipe(
                rptId,
                getPaymentRequestsGetResponse,
                O.fold(
                  () =>
                    res.status(404).json({
                      faultCodeCategory: FaultCategoryEnum.PAYMENT_UNKNOWN,
                      faultCodeDetail: ""
                    }),
                  response => res.status(200).json(response)
                )
              ),
            failure =>
              res.status(getStatusCodeForWalletFailure(failure)).json(failure)
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
          ioDevServerConfig.features.wallet?.activationFailure,
          WalletPaymentFailure.decode,
          O.fromEither,
          O.fold(
            () =>
              pipe(
                paymentNotices,
                getNewTransactionResponsePayload,
                O.fold(
                  () => res.sendStatus(404),
                  transaction => res.status(200).json(transaction)
                )
              ),
            failure =>
              res.status(getStatusCodeForWalletFailure(failure)).json(failure)
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
addPaymentHandler("post", "/payment-methods/:paymentId/fees", (req, res) =>
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
                  authorizationUrl: `${serverUrl}${WALLET_PAYMENT_PATH}?transactionId=${transactionId}`,
                  authorizationRequestId: ulid()
                } as RequestAuthorizationResponse)
            )
          )
      )
    )
);

// This API is used to create a mock transaction when the outcome selected is SUCCESS (0)
addPaymentHandler("post", "/mock-transaction", (req, res) =>
  pipe(
    req.body.transactionId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(403),
      transactionId =>
        pipe(
          getTransactionInfoPayload(transactionId),
          O.fold(
            () => res.sendStatus(404),
            () => {
              TransactionsDB.generateUserTransaction(transactionId, 0);
              return res.status(200).json({ status: "ok" });
            }
          )
        )
    )
  )
);

addPaymentHandler("get", "/wallets", (req, res) => {
  res.json({
    wallets: WalletDB.getUserWallets()
  });
});

/**
 * This API is used to retrieve a list of payment methods available
 */
addPaymentHandler("get", "/payment-methods", (req, res) => {
  res.json(generateOnboardablePaymentMethods());
});
