import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PaymentInfo } from "../../../../../generated/definitions/pagopa/ecommerce/PaymentInfo";
import { RptId } from "../../../../../generated/definitions/pagopa/ecommerce/RptId";

const paymentsData = new Map<string, PaymentInfo>();

// Updates or insert a new payment in the paymentRequestsData map and returns it
const upsertPayment = (payment: PaymentInfo): PaymentInfo =>
  pipe(
    payment,
    ({ rptId }) => paymentsData.set(rptId, payment),
    _ => payment
  );

const getPayment = (rptId: RptId): O.Option<PaymentInfo> =>
  O.fromNullable(paymentsData.get(rptId));

export { upsertPayment, getPayment };
