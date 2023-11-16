import { pipe } from "fp-ts/lib/function";
import { PaymentInfo } from "../../../../../generated/definitions/pagopa/ecommerce/PaymentInfo";

const paymentsData = new Map<string, PaymentInfo>();

// Updates or insert a new payment in the paymentRequestsData map and returns it
const upsertPayment = (paymentRequestData: PaymentInfo): PaymentInfo =>
  pipe(
    paymentRequestData,
    ({ rptId }) => paymentsData.set(rptId, paymentRequestData),
    _ => paymentRequestData
  );

export { upsertPayment };
