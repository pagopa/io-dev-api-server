import { PaymentFaultV2Enum } from "../../generated/definitions/communication/PaymentFaultV2";
import { PaymentInfoResponse } from "../../generated/definitions/communication/PaymentInfoResponse";

export interface ProcessablePayment {
  readonly type: "processable";
  readonly data: PaymentInfoResponse;
}

export interface ProcessedPayment {
  readonly type: "processed";
  readonly status: { detail_v2: PaymentFaultV2Enum };
}

export declare type PaymentStatus = ProcessablePayment | ProcessedPayment;

export const isProcessablePayment = (
  paymentStatus: PaymentStatus
): paymentStatus is ProcessablePayment => paymentStatus.type === "processable";
export const isProcessedPayment = (
  paymentStatus: PaymentStatus
): paymentStatus is ProcessedPayment => paymentStatus.type === "processed";

export const processablePayment = (
  data: PaymentInfoResponse
): ProcessablePayment => ({
  type: "processable",
  data
});
export const processedPayment = (status: {
  detail_v2: PaymentFaultV2Enum;
}): ProcessedPayment => ({
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
