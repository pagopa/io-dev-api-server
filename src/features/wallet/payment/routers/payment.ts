import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { CalculateFeeRequest } from "../../../../../generated/definitions/pagopa/ecommerce/CalculateFeeRequest";
import { RptId } from "../../../../../generated/definitions/pagopa/ecommerce/RptId";
import { getPaymentRequestsGetResponse } from "../payloads/payments";
import { addPaymentHandler } from "./router";

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
      () => res.status(200).json({})
    )
  )
);
