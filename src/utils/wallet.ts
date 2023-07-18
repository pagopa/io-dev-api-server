import { faker } from "@faker-js/faker";
import { serverUrl } from "./server";

const walletV1Path = "/wallet/v1";
export const appendWalletV1Prefix = (path: string) => `${walletV1Path}${path}`;
const walletV2Path = "/wallet/v2";
export const appendWalletV2Prefix = (path: string) => `${walletV2Path}${path}`;
const walletV3Path = "/wallet/v3";
export const appendWalletV3Prefix = (path: string) => `${walletV3Path}${path}`;

export const WALLET_ONBOARDING_PATH = "/onboarding-wallet";
export const generateOnboardingWalletData = () => ({
  id: faker.datatype.number({ min: 10000, max: 30000 }),
  redirectUrl: `${serverUrl}${WALLET_ONBOARDING_PATH}#sessionToken=${faker.datatype.string(
    20
  )}`
});
