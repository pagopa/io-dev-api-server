import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import WalletDB from "../persistence/userWallet";
import { generateOnboardablePaymentMethods } from "../utils/onboarding";
import { addPaymentWalletHandler } from "./router";

addPaymentWalletHandler("get", "/wallets", (req, res) => {
  res.json(WalletDB.getUserWallets());
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
 * This API is used to retrieve a list of payment methods available for the onboarding process
 */
addPaymentWalletHandler("get", "/payment-methods", (req, res) => {
  res.json(generateOnboardablePaymentMethods());
});
