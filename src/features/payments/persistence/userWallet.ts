import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import * as E from "fp-ts/lib/Either";
import _ from "lodash";
import { WalletApplication } from "../../../../generated/definitions/pagopa/walletv3/WalletApplication";
import { WalletApplicationInfo } from "../../../../generated/definitions/pagopa/walletv3/WalletApplicationInfo";
import { WalletApplicationStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletApplicationStatus";
import { WalletClientStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletClientStatus";
import { WalletInfo } from "../../../../generated/definitions/pagopa/walletv3/WalletInfo";
import { WalletInfoDetails } from "../../../../generated/definitions/pagopa/walletv3/WalletInfoDetails";
import { UserLastPaymentMethodResponse } from "../../../../generated/definitions/pagopa/ecommerce/UserLastPaymentMethodResponse";
import { WalletStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/WalletStatus";
import {
  WalletLastUsageType,
  WalletLastUsageTypeEnum
} from "../../../../generated/definitions/pagopa/ecommerce/WalletLastUsageType";
import { GuestMethodLastUsageType } from "../../../../generated/definitions/pagopa/ecommerce/GuestMethodLastUsageType";
import { uuidv4 } from "../../../utils/strings";
import { generateWalletDetailsByPaymentMethod } from "./paymentMethods";

const userWallets = new Map<WalletInfo["walletId"], WalletInfo>();

// eslint-disable-next-line functional/no-let, @typescript-eslint/no-unused-vars
let recentUsedPaymentMethod: UserLastPaymentMethodResponse | undefined;

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
  const walletId = uuidv4();
  const { details, paymentMethodAsset } =
    generateWalletDetailsByPaymentMethod(paymentMethodId);

  const randomWallet: WalletInfo = {
    walletId,
    paymentMethodId: paymentMethodId.toString(),
    status: WalletStatusEnum.VALIDATED,
    creationDate: faker.date.past(2),
    updateDate: faker.date.past(1),
    clients: {
      IO: {
        status: WalletClientStatusEnum.ENABLED,
        lastUsage: faker.date.recent()
      }
    },
    applications: [
      {
        name: "PAGOPA",
        status: WalletApplicationStatusEnum.ENABLED
      }
    ],
    paymentMethodAsset,
    details: _.merge(details, extraDetails)
  };
  addUserWallet(randomWallet);
  return randomWallet;
};

const generateWalletData = () => {
  generateUserWallet(2);
  generateUserWallet(1);
  generateUserWallet(1, { expiryDate: format(faker.date.past(1), "yyyyMM") });
};

const updateUserWalletApplication = (
  walletId: string,
  applications?: ReadonlyArray<WalletApplication>
) => {
  if (getUserWalletInfo(walletId) && applications) {
    const userWallet = getUserWalletInfo(walletId) as WalletInfo;
    removeUserWallet(walletId);
    const wallet = _.merge(userWallet, {
      applications: applications.map(
        service =>
          ({
            ...service,
            updateDate: new Date()
          } as WalletApplicationInfo)
      )
    });
    addUserWallet(wallet);
    return E.right(wallet);
  }
  return E.left("Wallet not found");
};

const setRecentUsedPaymentMethod = (
  id: string,
  type: WalletLastUsageType | GuestMethodLastUsageType
) => {
  if (type === WalletLastUsageTypeEnum.wallet) {
    recentUsedPaymentMethod = {
      date: new Date(),
      type,
      walletId: id
    };
    return;
  }
  recentUsedPaymentMethod = {
    date: new Date(),
    type,
    paymentMethodId: id
  };
};

const getRecentusedPaymentMethod = () => recentUsedPaymentMethod;

// At server startup
generateWalletData();

export default {
  addUserWallet,
  getUserWallets,
  getUserWalletInfo,
  generateUserWallet,
  removeUserWallet,
  setRecentUsedPaymentMethod,
  getRecentusedPaymentMethod,
  updateUserWalletApplication
};
