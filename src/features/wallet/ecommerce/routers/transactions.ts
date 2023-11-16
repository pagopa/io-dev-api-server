import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { NewTransactionRequest } from "../../../../../generated/definitions/pagopa/ecommerce/NewTransactionRequest";
import { RequestAuthorizationRequest } from "../../../../../generated/definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { addECommerceHandler } from "./router";

addECommerceHandler("post", "/transactions", (req, res) =>
  pipe(
    NewTransactionRequest.decode(req.body),
    O.fromEither,
    O.fold(
      () => res.sendStatus(403),
      () => res.status(200).json({})
    )
  )
);

addECommerceHandler("get", "/transactions/:transactionId", (req, res) =>
  res.status(200).json({})
);

addECommerceHandler("delete", "/transactions/:transactionId", (req, res) =>
  res.sendStatus(202)
);

addECommerceHandler(
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
        () => res.status(200).json({})
      )
    )
);
