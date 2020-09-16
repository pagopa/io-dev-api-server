/**
 * this router handles all requests about wallets
 */
import { Router } from "express";
import { takeEnd } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import { TransactionListResponse } from "../../generated/definitions/pagopa/TransactionListResponse";
import { Wallet } from "../../generated/definitions/pagopa/Wallet";
import { getTransactions, getWallets, sessionToken } from "../payloads/wallet";
import { validatePayload } from "../utils/validator";

export const walletRouter = Router();
const walletPath = "/wallet/v1";
const appendWalletPrefix = (path: string) => `${walletPath}${path}`;

// wallets and transactions
export const wallets = getWallets();
export const transactionPageSize = 10;
export const transactionsTotal = 25;
export const transactions = getTransactions(transactionsTotal, wallets.data);

walletRouter.get(
  appendWalletPrefix("/users/actions/start-session"),
  (_, res) => {
    res.json(sessionToken);
  }
);

walletRouter.get(appendWalletPrefix("/wallet"), (_, res) => {
  res.json(wallets);
});

walletRouter.post(
  appendWalletPrefix("/wallet/:wallet_id/actions/favourite"),
  (req, res) => {
    fromNullable(wallets.data)
      .chain((d: ReadonlyArray<Wallet>) => {
        const maybeWallet = d.find(
          w => w.idWallet === parseInt(req.params.wallet_id, 10)
        );
        return fromNullable(maybeWallet);
      })
      .foldL(
        () => res.sendStatus(404),
        w => res.json({ data: w })
      );
  }
);

walletRouter.get(appendWalletPrefix("/transactions"), (req, res) => {
  const start = fromNullable(req.query.start)
    .map(s => Math.max(parseInt(s, 10), 0))
    .getOrElse(0);
  const transactionsSlice = takeEnd(
    transactions.length - Math.min(start, transactions.length),
    [...transactions]
  ).slice(0, transactionPageSize);
  const response = validatePayload(TransactionListResponse, {
    data: transactionsSlice,
    size: transactionsSlice.length,
    total: transactions.length
  });
  res.json(response);
});
