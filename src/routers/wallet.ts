/**
 * this router handles all requests about wallets
 */
import { Router } from "express";
import * as faker from "faker";
import { takeEnd } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import { CardInfo } from "../../generated/definitions/pagopa/walletv2/CardInfo";
import { TransactionListResponse } from "../../generated/definitions/pagopa/walletv2/TransactionListResponse";
import {
  TypeEnum,
  Wallet
} from "../../generated/definitions/pagopa/walletv2/Wallet";
import { WalletResponse } from "../../generated/definitions/pagopa/walletv2/WalletResponse";
import { WalletTypeEnum } from "../../generated/definitions/pagopa/walletv2/WalletV2";
import { addHandler } from "../payloads/response";
import {
  getPsps,
  getTransactions,
  getWallets,
  sessionToken
} from "../payloads/wallet";
import {
  abiData,
  generateCards,
  generateWalletV2FromCard
} from "../payloads/wallet_v2";
import { interfaces, serverPort } from "../utils/server";
import { toPayload, validatePayload } from "../utils/validator";
import { addWalletV2 } from "./wallet_v2";
export const walletCount = 4;
export const walletRouter = Router();
const walletPath = "/wallet/v1";
const appendWalletPrefix = (path: string) => `${walletPath}${path}`;
// wallets and transactions
export const wallets = getWallets(walletCount);
export const transactionPageSize = 10;
export const transactionsTotal = 25;
export const transactions = getTransactions(
  transactionsTotal,
  true,
  wallets.data
);
addHandler(
  walletRouter,
  "get",
  appendWalletPrefix("/users/actions/start-session"),
  (_, res) => res.json(sessionToken)
);
addHandler(walletRouter, "get", appendWalletPrefix("/wallet"), (_, res) =>
  res.json(wallets)
);
addHandler(
  walletRouter,
  "post",
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
addHandler(
  walletRouter,
  "get",
  appendWalletPrefix("/transactions"),
  (req, res) => {
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
  }
);

addHandler(
  walletRouter,
  "get",
  appendWalletPrefix("/psps/:psp_id"),
  (req, res) => {
    fromNullable(
      getPsps().find(p => p.id === parseInt(req.params.psp_id, 10))
    ).foldL(
      () => res.sendStatus(404),
      p => res.json({ data: p })
    );
  }
);

addHandler(walletRouter, "get", appendWalletPrefix("/psps"), (_, res) =>
  res.json({ data: getPsps() })
);

addHandler(walletRouter, "post", appendWalletPrefix("/wallet/cc"), (_, res) => {
  const cards = generateCards(abiData, 1, WalletTypeEnum.Card);
  const walletV2 = generateWalletV2FromCard(cards[0], WalletTypeEnum.Card);
  const info = walletV2.info as CardInfo;
  // add new wallet to the existing ones
  addWalletV2([walletV2]);
  const response: WalletResponse = {
    data: {
      idWallet: walletV2.idWallet,
      type: TypeEnum.CREDIT_CARD,
      favourite: false,
      creditCard: {
        id: walletV2.idWallet,
        holder: info.holder,
        pan: "*".repeat(12) + (info.blurredNumber ?? ""),
        expireMonth: info.expireMonth!.padStart(2, "0"),
        expireYear: info.expireYear!.slice(-2),
        brandLogo:
          "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/generic.png",
        flag3dsVerified: false,
        brand: "OTHER",
        onUs: false
      },
      pspEditable: true,
      isPspToIgnore: false,
      saved: false,
      registeredNexi: false
    }
  };
  res.json(response);
});

const checkOutSuffix = "/wallet/loginMethod";
addHandler(
  walletRouter,
  "post",
  appendWalletPrefix("/payments/cc/actions/pay"),
  (_, res) => {
    return toPayload({
      data: {
        id: faker.random.number({ min: 20000, max: 30000 }),
        created: "2020-10-26T08:31:49Z",
        updated: "2020-10-26T08:31:49Z",
        amount: {
          currency: "EUR",
          amount: 1,
          decimalDigits: 2
        },
        grandTotal: {
          currency: "EUR",
          amount: 2,
          decimalDigits: 2
        },
        description: "SET_SUBJECT",
        merchant: "",
        idStatus: 0,
        statusMessage: "Da autorizzare",
        error: false,
        success: false,
        fee: {
          currency: "EUR",
          amount: 1,
          decimalDigits: 2
        },
        urlCheckout3ds: `http://${interfaces.name}:${serverPort}${checkOutSuffix}`,
        paymentModel: 0,
        token: "MTg5MDIxNzQ=",
        idWallet: 12345678,
        idPayment: 27297685,
        nodoIdPayment: "571e211e-776d-4ae6-8066-fb3aaf8333c5",
        orderNumber: 18902174,
        directAcquirer: false
      }
    });
  }
);

// this API is not official is the way out to exit the credit card checkout
addHandler(
  walletRouter,
  "get",
  appendWalletPrefix(checkOutSuffix),
  (req, res) => {
    res.sendStatus(200);
  }
);
