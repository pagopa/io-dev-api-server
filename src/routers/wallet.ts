/**
 * this router handles all requests about wallets
 */
import { Request, Response, Router } from "express";
import * as faker from "faker";
import { takeEnd } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import { CardInfo } from "../../generated/definitions/pagopa/walletv2/CardInfo";
import { TransactionListResponse } from "../../generated/definitions/pagopa/walletv2/TransactionListResponse";
import { TypeEnum } from "../../generated/definitions/pagopa/walletv2/Wallet";
import { WalletResponse } from "../../generated/definitions/pagopa/walletv2/WalletResponse";
import { WalletTypeEnum } from "../../generated/definitions/pagopa/walletv2/WalletV2";
import { addHandler } from "../payloads/response";
import {
  getPspFromId,
  getTransactions,
  getWallets,
  pspList,
  sessionToken,
  validPsp
} from "../payloads/wallet";
import {
  abiData,
  generateCards,
  generateWalletV1FromCardInfo,
  generateWalletV2FromCard
} from "../payloads/wallet_v2";
import { interfaces, serverPort } from "../utils/server";
import { validatePayload } from "../utils/validator";
import {
  addWalletV2,
  findWalletfromId,
  removeWalletV2,
  walletV2Config
} from "./walletsV2";
export const walletCount =
  walletV2Config.satispay +
  walletV2Config.walletBancomat +
  walletV2Config.walletCreditCard +
  walletV2Config.walletCreditCardCoBadge +
  walletV2Config.bPay;
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

/**
 * invoked by the client when want to know if a payment ends successfully
 * see https://docs.google.com/presentation/d/11rEttb7lJYlRqgFpl4QopyjFmjt2Q0K8uis6JhAQaCw/edit#slide=id.g854399c4e5_0_137
 */
addHandler(
  walletRouter,
  "get",
  appendWalletPrefix("/transactions/:idTransaction"),
  (req, res) => {
    if (transactions.length === 0) {
      res.sendStatus(404);
      return;
    }
    const transaction = transactions[0];
    res.json({ data: transaction });
  }
);

addHandler(walletRouter, "get", appendWalletPrefix("/psps"), (_, res) =>
  res.json({ data: [validPsp] })
);

addHandler(
  walletRouter,
  "get",
  appendWalletPrefix("/psps/selected"),
  (req, res) => {
    const randomPsp = faker.random.arrayElement(pspList);
    const language = req.query.language ?? "IT";
    res.json({
      data: [{ ...randomPsp, lingua: language.toUpperCase() }]
    });
  }
);

addHandler(walletRouter, "get", appendWalletPrefix("/psps/all"), (req, res) => {
  const language = req.query.language ?? "IT";
  res.json({
    data: pspList.map(p => ({ ...p, lingua: language.toUpperCase() }))
  });
});

addHandler(
  walletRouter,
  "get",
  appendWalletPrefix("/psps/:psp_id"),
  (req, res) => {
    res.json({ data: validPsp });
  }
);

addHandler(
  walletRouter,
  "delete",
  appendWalletPrefix("/wallet/:idWallet"),
  (req, res) => {
    const idWallet = parseInt(req.params.idWallet, 10);
    const hasBeenDelete = removeWalletV2(idWallet);
    res.sendStatus(hasBeenDelete ? 200 : 404);
  }
);

addHandler(
  walletRouter,
  "put",
  appendWalletPrefix("/wallet/:idWallet"),
  (req, res) => {
    const idWallet = parseInt(req.params.idWallet, 10);
    const idPsp = req.body.data.idPsp;
    const psp = getPspFromId(idPsp);
    const walletV2 = findWalletfromId(idWallet);
    if (walletV2 === undefined || psp === undefined) {
      res.sendStatus(404);
      return;
    }
    const updatedWalletV1 = generateWalletV1FromCardInfo(
      walletV2.idWallet!,
      walletV2.info as CardInfo
    );
    res.json({
      data: { ...updatedWalletV1, psp }
    });
  }
);

// step 1/3 - credit card
// adding a temporary wallet
addHandler(walletRouter, "post", appendWalletPrefix("/wallet/cc"), (_, res) => {
  const cards = generateCards(abiData, 1, WalletTypeEnum.Card);
  const walletV2 = generateWalletV2FromCard(
    cards[0],
    WalletTypeEnum.Card,
    true
  );
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
        brand: info.brand,
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
// step 2/3 - credit card
// verification
addHandler(
  walletRouter,
  "post",
  appendWalletPrefix("/payments/cc/actions/pay"),
  (_, res) => {
    res.json({
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
