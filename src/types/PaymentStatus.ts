import {
  PaymentProblemJson
} from "../../generated/definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../generated/definitions/backend/PaymentRequestsGetResponse";

export interface ProcessablePayment {
  readonly type: "processable";
  readonly data: PaymentRequestsGetResponse;
}

export interface ProcessedPayment {
  readonly type: "processed";
  readonly status: PaymentProblemJson;
}

export declare type PaymentStatus = ProcessablePayment | ProcessedPayment;

export const isProcessablePayment = (
  paymentStatus: PaymentStatus
): paymentStatus is ProcessablePayment => paymentStatus.type === "processable";
export const isProcessedPayment = (
  paymentStatus: PaymentStatus
): paymentStatus is ProcessedPayment => paymentStatus.type === "processed";

export const processablePayment = (
  paymentRequestsGetResponse: PaymentRequestsGetResponse
): ProcessablePayment => ({
  type: "processable",
  data: paymentRequestsGetResponse
});
export const processedPayment = (
  status: PaymentProblemJson
): ProcessedPayment => ({
  type: "processed",
  status
});

export const foldW =
  <A, B>(
    onProcessed: (processedPayment: ProcessedPayment) => A,
    onProcessable: (processablePayment: ProcessablePayment) => B
  ) =>
  (paymentStatus: PaymentStatus): A | B =>
    isProcessedPayment(paymentStatus)
      ? onProcessed(paymentStatus)
      : onProcessable(paymentStatus);
export const fold: <A>(
  onProcessed: (processedPayment: ProcessedPayment) => A,
  onProcessable: (processablePayment: ProcessablePayment) => A
) => (paymentStatus: PaymentStatus) => A = foldW;
