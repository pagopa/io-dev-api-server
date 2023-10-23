import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";

import WalletDB from "../../../../persistence/wallet";
import { WalletCreateRequest } from "../../../../../generated/definitions/pagopa/walletv3/WalletCreateRequest";
import { generateOnboardingWalletData } from "../../../../utils/wallet";
import { addPaymentMethodsHandler, addWalletV3Handler } from "../router";
import { generateOnboardablePaymentMethods } from "./utils";

/**
 * This API is used to start an onboarding process for a new method of payment
 */
addWalletV3Handler("post", "/", (req, res) => {
  pipe(
    WalletCreateRequest.decode(req.body),
    E.fold(
      () => res.sendStatus(400),
      () => res.status(201).json(generateOnboardingWalletData())
    )
  );
});

addWalletV3Handler("get", "/", (req, res) => {
  res.json(WalletDB.getUserWallets());
});

/**
 * This API is used to retrieve a list of payment methods available for the onboarding process
 */
addPaymentMethodsHandler("get", "/", (req, res) => {
  res.json(generateOnboardablePaymentMethods());
});

/**
 * This API is used to start an onboarding process for a new method of payment
 */
addWalletV3Handler("post", "/mock", (req, res) => {
  const { paymentMethodId } = req.body;
  const generatedWallet = WalletDB.generateUserWallet(paymentMethodId);
  res.json(generatedWallet);
});
