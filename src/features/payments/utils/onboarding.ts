import { faker } from "@faker-js/faker";
import { WalletCreateResponse } from "../../../../generated/definitions/pagopa/walletv3/WalletCreateResponse";
import { serverUrl } from "../../../utils/server";
import { PaymentMethodsResponse } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodsResponse";
import { allPaymentMethods } from "../payloads/paymentMethods";

export const generateOnboardablePaymentMethods = (): PaymentMethodsResponse =>
  allPaymentMethods;

export const getWalletTypeFromPaymentMethodId = (
  paymentMethodId: string
): string =>
  allPaymentMethods.paymentMethods?.find(({ id }) => id === paymentMethodId)
    ?.paymentTypeCode || "CARDS";

export const WALLET_ONBOARDING_PATH = "/wallets/outcomes";
export const generateOnboardingWalletData = (
  paymentMethodId: string
): WalletCreateResponse => ({
  redirectUrl: `${serverUrl}${WALLET_ONBOARDING_PATH}?paymentMethodId=${paymentMethodId}#sessionToken=${faker.datatype.uuid()}`
});
