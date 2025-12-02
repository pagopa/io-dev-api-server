import { fakerIT as faker } from "@faker-js/faker";
import { WalletCreateResponse } from "../../../../generated/definitions/pagopa/walletv3/WalletCreateResponse";
import { serverUrl } from "../../../utils/server";
import { PaymentMethodsResponse } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodsResponse";
import { allPaymentMethods } from "../payloads/paymentMethods";

type GenerateOnboardingWalletDataParams = {
  paymentMethodId: string;
  contextualOnboarding: boolean;
};

export const generateOnboardablePaymentMethods = (): PaymentMethodsResponse =>
  allPaymentMethods;

export const getWalletTypeFromPaymentMethodId = (
  paymentMethodId: string
): string =>
  allPaymentMethods.paymentMethods?.find(({ id }) => id === paymentMethodId)
    ?.paymentTypeCode || "CARDS";

export const WALLET_ONBOARDING_PATH = "/wallets/outcomes";
export const generateOnboardingWalletData = ({
  paymentMethodId,
  contextualOnboarding = false
}: GenerateOnboardingWalletDataParams): WalletCreateResponse => ({
  redirectUrl: `${serverUrl}${WALLET_ONBOARDING_PATH}?paymentMethodId=${paymentMethodId}&contextualOnboarding=${contextualOnboarding}#sessionToken=${faker.string.uuid()}`
});
