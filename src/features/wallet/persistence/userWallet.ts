import { faker } from "@faker-js/faker";
import * as E from "fp-ts/lib/Either";
import { WalletApplication } from "../../../../generated/definitions/pagopa/walletv3/WalletApplication";
import { WalletApplicationStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletApplicationStatus";
import { WalletInfo } from "../../../../generated/definitions/pagopa/walletv3/WalletInfo";
import { WalletStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletStatus";
import { generateWalletDetailsByPaymentMethod } from "./paymentMethods";
import { WalletInfoDetails } from "../../../../generated/definitions/pagopa/walletv3/WalletInfoDetails";
import _ from "lodash";
import { format } from "date-fns";

const userWallets = new Map<WalletInfo["walletId"], WalletInfo>();

const getUserWallets = () => Array.from(userWallets.values());

const getUserWalletInfo = (walletId: WalletInfo["walletId"]) =>
  userWallets.get(walletId);

const addUserWallet = (wallet: WalletInfo) => {
  userWallets.set(wallet.walletId, wallet);
};

const removeUserWallet = (walletId: WalletInfo["walletId"]) => {
  userWallets.delete(walletId);
};

const generateUserWallet = (
  paymentMethodId: number,
  extraDetails: Partial<WalletInfoDetails> = {}
) => {
  const walletId = (getUserWallets().length + 1).toString();
  const details = _.merge(
    generateWalletDetailsByPaymentMethod(paymentMethodId),
    extraDetails
  );

  const randomWallet: WalletInfo = {
    walletId,
    paymentMethodId: paymentMethodId.toString(),
    status: WalletStatusEnum.CREATED,
    creationDate: faker.date.past(2),
    updateDate: faker.date.past(1),
    applications: [
      {
        name: "PAGOPA",
        status: WalletApplicationStatusEnum.ENABLED
      }
    ],
    paymentMethodAsset:
      "https://github.com/pagopa/io-services-metadata/blob/master/logos/apps/carte-pagamento.png?raw=true",
    details
  };
  addUserWallet(randomWallet);
  return randomWallet;
};

const generateWalletData = () => {
  generateUserWallet(3);
  generateUserWallet(2);
  generateUserWallet(1);
  generateUserWallet(1, { expiryDate: format(faker.date.past(1), "yyyyMM") });
};

const updateUserWalletApplication = (
  walletId: string,
  services?: ReadonlyArray<WalletApplication>
) => {
  if (getUserWalletInfo(walletId) && services) {
    const userWallet = getUserWalletInfo(walletId) as WalletInfo;
    removeUserWallet(walletId);
    const wallet: WalletInfo = {
      ...userWallet,
      applications: services.map(
        service =>
          ({
            ...service,
            updateDate: new Date()
          } as WalletApplication)
      )
    };
    addUserWallet(wallet);
    return E.right(wallet);
  }
  return E.left("Wallet not found");
};

// At server startup
generateWalletData();

export default {
  addUserWallet,
  getUserWallets,
  getUserWalletInfo,
  generateUserWallet,
  removeUserWallet,
  updateUserWalletApplication
};
