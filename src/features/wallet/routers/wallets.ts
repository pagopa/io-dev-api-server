import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { WalletCreateRequest } from "../../../../generated/definitions/pagopa/walletv3/WalletCreateRequest";
import { WalletServiceUpdateRequest } from "../../../../generated/definitions/pagopa/walletv3/WalletServiceUpdateRequest";
import WalletDB from "../persistence/userWallet";
import {
  generateOnboardablePaymentMethods,
  generateOnboardingWalletData
} from "../utils/onboarding";
import { addPaymentWalletHandler } from "./router";

addPaymentWalletHandler("get", "/wallets", (req, res) => {
  res.json({ wallets: WalletDB.getUserWallets() });
});

addPaymentWalletHandler("get", "/wallets/:idWallet", (req, res) => {
  const { idWallet } = req.params;
  const result = WalletDB.getUserWalletInfo(idWallet);
  pipe(
    result,
    O.fromNullable,
    O.map(() => res.json(WalletDB.getUserWalletInfo(idWallet))),
    O.getOrElse(() => res.sendStatus(400))
  );
});

addPaymentWalletHandler("delete", "/wallets/:idWallet", (req, res) => {
  const { idWallet } = req.params;
  const result = WalletDB.getUserWalletInfo(idWallet);
  pipe(
    result,
    O.fromNullable,
    O.map(() => {
      WalletDB.removeUserWallet(idWallet);
      res.sendStatus(204);
    }),
    O.getOrElseW(() => res.status(400).json({ text: "Wallet id not present" }))
  );
});

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
 * This API is used to enable and disable an existing wallet service
 */
addPaymentWalletHandler("put", "/wallets/:idWallet/services", (req, res) => {
  pipe(
    WalletServiceUpdateRequest.decode(req.body),
    E.fold(
      () => res.sendStatus(404),
      request =>
        pipe(
          request,
          request =>
            WalletDB.updateUserWalletService(
              req.params.idWallet,
              request.services
            ),
          E.fold(
            () => res.sendStatus(404),
            () => res.sendStatus(204)
          )
        )
    )
  );
});

/**
 * This API is used to start an onboarding process for a new method of payment
 */
addPaymentWalletHandler("post", "/wallets/mock", (req, res) => {
  const { paymentMethodId } = req.body;
  const generatedWallet = WalletDB.generateUserWallet(paymentMethodId);
  res.json(generatedWallet);
});

/**
 * This API is used to retrieve a list of payment methods available
 */
addPaymentWalletHandler("get", "/payment-methods", (req, res) => {
  res.json(generateOnboardablePaymentMethods());
});
