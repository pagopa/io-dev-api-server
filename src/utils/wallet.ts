const walletV1Path = "/wallet/v1";
export const appendWalletPrefix = (path: string) => `${walletV1Path}${path}`;
const walletPath = "/wallet/v2";
export const appendWalletV2Prefix = (path: string) => `${walletPath}${path}`;
