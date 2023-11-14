import { PaymentMethodsResponse } from "../../../../../generated/definitions/pagopa/walletv3/PaymentMethodsResponse";
import { TypeEnum } from "../../../../../generated/definitions/pagopa/walletv3/WalletInfoDetails";
import { allPaymentMethods } from "./data";

export const generateOnboardablePaymentMethods = (): PaymentMethodsResponse =>
  allPaymentMethods;

export const getWalletTypeFromPaymentMethodId = (
  paymentMethodId: string
): TypeEnum =>
  allPaymentMethods.paymentMethods?.find(({ id }) => id === paymentMethodId)
    ?.paymentTypeCode as TypeEnum;
