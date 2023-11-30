import { faker } from "@faker-js/faker";
import { ServiceNameEnum } from "../../../../generated/definitions/pagopa/walletv3/ServiceName";
import { WalletInfo } from "../../../../generated/definitions/pagopa/walletv3/WalletInfo";
import { BrandEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletInfoDetails";
import { WalletStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletStatus";
import { allPaymentMethods } from "../payloads/paymentMethods";
import { getWalletTypeFromPaymentMethodId } from "../utils/onboarding";

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
    services: [
      {
        name: ServiceNameEnum.PAGOPA
      }
    ],
    status: WalletStatusEnum.CREATED,
    updateDate: new Date(),
    walletId,
    details: {
      type: getWalletTypeFromPaymentMethodId(paymentMethodId),
      maskedEmail: "***t@gmail.com",
      abi: faker.datatype.string(4),
      brand: BrandEnum.MASTERCARD,
      expiryDate: expiryDate.toISOString(),
      holder: faker.name.fullName(),
      maskedPan: "0000"
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

// At server startup
generateWalletData();

export default {
  addUserWallet,
  getUserWallets,
  getUserWalletInfo,
  generateUserWallet,
  removeUserWallet
};
