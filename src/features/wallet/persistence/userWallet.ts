import { faker } from "@faker-js/faker";
import * as E from "fp-ts/lib/Either";
import { WalletInfo } from "../../../../generated/definitions/pagopa/walletv3/WalletInfo";
import { BrandEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletInfoDetails";
import { WalletStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletStatus";
import { allPaymentMethods } from "../payloads/paymentMethods";
import { getWalletTypeFromPaymentMethodId } from "../utils/onboarding";
import { WalletApplicationStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletApplicationStatus";
import { WalletApplication } from "../../../../generated/definitions/pagopa/walletv3/WalletApplication";

const userWallets = new Map<string, WalletInfo>();

const addUserWallet = (walletId: string, wallet: WalletInfo) => {
  userWallets.set(walletId, wallet);
};

const getUserWallets = () => Array.from(userWallets.values());

const getUserWalletInfo = (walletId: string) => userWallets.get(walletId);

const generateUserWallet = (paymentMethodId: string) => {
  const walletId = (getUserWallets().length + 1).toString();
  const expiryDate = faker.date.future();
  const randomWallet: WalletInfo = {
    creationDate: new Date(),
    paymentMethodId,
    applications: [
      {
        name: "PAGOPA",
        status: WalletApplicationStatusEnum.ENABLED
      }
    ],
    status: WalletStatusEnum.CREATED,
    updateDate: new Date(),
    paymentMethodAsset:
      "https://github.com/pagopa/io-services-metadata/blob/master/logos/apps/carte-pagamento.png?raw=true",
    walletId,
    details: {
      type: getWalletTypeFromPaymentMethodId(paymentMethodId),
      maskedEmail: "***t@gmail.com",
      abi: faker.datatype.string(4),
      brand: BrandEnum.MASTERCARD,
      expiryDate: expiryDate.toISOString(),
      bankName: faker.name.fullName(),
      lastFourDigits: "0000"
    }
  };
  addUserWallet(walletId, randomWallet);
  return randomWallet;
};

const removeUserWallet = (walletId: string) => {
  userWallets.delete(walletId);
};

const generateWalletData = () => {
  generateUserWallet(
    faker.helpers.arrayElement(allPaymentMethods.paymentMethods).id
  );
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
    addUserWallet(walletId, wallet);
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
