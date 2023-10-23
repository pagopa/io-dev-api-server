import { faker } from "@faker-js/faker";
import { WalletInfo } from "../../generated/definitions/pagopa/walletv3/WalletInfo";
import { ServiceNameEnum } from "../../generated/definitions/pagopa/walletv3/ServiceName";
import { WalletStatusEnum } from "../../generated/definitions/pagopa/walletv3/WalletStatus";

const userWallets = new Map<string, WalletInfo>();

const addUserWallet = (walletId: string, wallet: WalletInfo) => {
  userWallets.set(walletId, wallet);
};

const getUserWallets = () => Array.from(userWallets.values());

const getUserWalletInfo = (walletId: string) => userWallets.get(walletId);

const generateUserWallet = (paymentMethodId: string) => {
  const walletId = (getUserWallets().length + 1).toString();
  const randomWallet: WalletInfo = {
    contractId: "2",
    creationDate: new Date(),
    paymentMethodId,
    services: [
      {
        name: ServiceNameEnum.PAGOPA
      }
    ],
    status: WalletStatusEnum.CREATED,
    updateDate: new Date(),
    userId: faker.datatype.uuid(),
    walletId
  };
  addUserWallet(walletId, randomWallet);
  return randomWallet;
};

export default {
  addUserWallet,
  getUserWallets,
  getUserWalletInfo,
  generateUserWallet
};
