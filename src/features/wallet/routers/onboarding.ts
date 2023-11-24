import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { WalletCreateRequest } from "../../../../generated/definitions/pagopa/walletv3/WalletCreateRequest";
import WalletDB from "../persistence/userWallet";
import {
  generateOnboardablePaymentMethods,
  generateOnboardingWalletData
} from "../utils/onboarding";
import { addPaymentWalletHandler } from "./router";

/**
 * This API is used to start an onboarding process for a new method of payment
 */
addPaymentWalletHandler("post", "/wallets", (req, res) => {
  pipe(
    WalletCreateRequest.decode(req.body),
    E.fold(
      () => res.sendStatus(404),
      () =>
        res
          .status(201)
          .json(generateOnboardingWalletData(req.body.paymentMethodId))
    )
  );
});

/**
 * This API is used to retrieve a list of payment methods available for the onboarding process
 */
addPaymentWalletHandler("get", "/payment-methods", (req, res) => {
  res.json(generateOnboardablePaymentMethods());
});

/**
 * This API is used to start an onboarding process for a new method of payment
 */
addPaymentWalletHandler("post", "/wallets/mock", (req, res) => {
  const { paymentMethodId } = req.body;
  const generatedWallet = WalletDB.generateUserWallet(paymentMethodId);
  res.json(generatedWallet);
});
