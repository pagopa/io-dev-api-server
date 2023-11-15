import { PaymentMethodsResponse } from "../../../../../generated/definitions/pagopa/walletv3/PaymentMethodsResponse";
import { allPaymentMethods } from "./data";

export const generateOnboardablePaymentMethods = (): PaymentMethodsResponse =>
  allPaymentMethods;