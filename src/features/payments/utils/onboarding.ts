import { faker } from "@faker-js/faker";
import { WalletCreateResponse } from "../../../../generated/definitions/pagopa/walletv3/WalletCreateResponse";
import { serverUrl } from "../../../utils/server";

export const WALLET_ONBOARDING_PATH = "/wallets/outcomes";

export const generateOnboardingWalletData = (
  paymentMethodId: string
): WalletCreateResponse => ({
  redirectUrl: `${serverUrl}${WALLET_ONBOARDING_PATH}?paymentMethodId=${paymentMethodId}#sessionToken=${faker.datatype.uuid()}`
});
