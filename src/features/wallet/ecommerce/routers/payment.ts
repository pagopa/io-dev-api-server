import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { addECommerceHandler } from "./router";

addECommerceHandler("get", "/payment-requests/:rpt_id", (req, res) =>
  pipe(
    O.fromNullable(req.params.rpt_id),
    // O.map(PaymentsDB.getPaymentStatus),
    O.fold(
      () => res.sendStatus(403),
      () => res.status(200).json({})
    )
  )
);

addECommerceHandler("get", "/payment-methods/:id/fees", (req, res) =>
  pipe(
    O.fromNullable(req.params.id),
    O.fold(
      () => res.sendStatus(403),
      () => res.status(200).json({})
    )
  )
);
