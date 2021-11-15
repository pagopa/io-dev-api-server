/**
 * this router handles all requests about wallets
 */
import { Router } from "express";
import * as faker from "faker";
import { takeEnd } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import { CardInfo } from "../../generated/definitions/pagopa/CardInfo";
import { EnableableFunctionsEnum } from "../../generated/definitions/pagopa/EnableableFunctions";
import { PayPalInfo } from "../../generated/definitions/pagopa/PayPalInfo";
import { Transaction } from "../../generated/definitions/pagopa/Transaction";
import { TransactionListResponse } from "../../generated/definitions/pagopa/TransactionListResponse";
import { TypeEnum } from "../../generated/definitions/pagopa/Wallet";
import { WalletPaymentStatusRequest } from "../../generated/definitions/pagopa/WalletPaymentStatusRequest";
import { WalletResponse } from "../../generated/definitions/pagopa/WalletResponse";
import {
  WalletTypeEnum,
  WalletV2
} from "../../generated/definitions/pagopa/WalletV2";
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
  generateWalletV1FromPayPal,
  generateWalletV2FromCard
} from "../payloads/wallet_v2";
import { interfaces, serverPort } from "../utils/server";
import { validatePayload } from "../utils/validator";
import { appendWalletV1Prefix, appendWalletV2Prefix } from "../utils/wallet";
import {
  addWalletV2,
  findWalletById,
  getWalletV2,
  removeWalletV2,
  walletV2Config
} from "./walletsV2";
export const walletCount =
  walletV2Config.paypalCount +
  walletV2Config.satispayCount +
  walletV2Config.privativeCount +
  walletV2Config.walletBancomatCount +
  walletV2Config.walletCreditCardCount +
  walletV2Config.walletCreditCardCoBadgeCount +
  walletV2Config.bPayCount;
export const walletRouter = Router();
// wallets and transactions
export const wallets = getWallets(walletCount);
export const transactionPageSize = 10;
export const transactionsTotal = 25;
export const transactions: ReadonlyArray<Transaction> = getTransactions(
  transactionsTotal,
  true,
  wallets.data
);
addHandler(
  walletRouter,
  "get",
  appendWalletV1Prefix("/users/actions/start-session"),
  (_, res) => res.send(sessionToken)
);
addHandler(walletRouter, "get", appendWalletV1Prefix("/wallet"), (_, res) =>
  res.json(wallets)
);

addHandler(
  walletRouter,
  "get",
  appendWalletV1Prefix("/transactions"),
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
  appendWalletV1Prefix("/transactions/:idTransaction"),
  (req, res) => {
    if (transactions.length === 0) {
      res.sendStatus(404);
      return;
    }
    const idTransactions = parseInt(req.params.idTransaction, 10);
    const transaction = transactions.find(t => t.id === idTransactions);
    if (transaction === undefined) {
      res.sendStatus(404);
      return;
    }
    res.json({ data: transaction });
  }
);

addHandler(walletRouter, "get", appendWalletV1Prefix("/psps"), (_, res) =>
  res.json({ data: [validPsp] })
);

addHandler(
  walletRouter,
  "get",
  appendWalletV1Prefix("/psps/selected"),
  (req, res) => {
    const randomPsp = faker.random.arrayElement(pspList);
    const language = req.query.language ?? "IT";
    res.json({
      data: [{ ...randomPsp, lingua: language.toUpperCase() }]
    });
  }
);

addHandler(
  walletRouter,
  "get",
  appendWalletV1Prefix("/psps/all"),
  (req, res) => {
    const language = req.query.language ?? "IT";
    res.json({
      data: pspList.map(p => ({ ...p, lingua: language.toUpperCase() }))
    });
  }
);

addHandler(
  walletRouter,
  "get",
  appendWalletV1Prefix("/psps/:psp_id"),
  (req, res) => {
    res.json({ data: validPsp });
  }
);

addHandler(
  walletRouter,
  "delete",
  appendWalletV1Prefix("/wallet/:idWallet"),
  (req, res) => {
    const idWallet = parseInt(req.params.idWallet, 10);
    const hasBeenDelete = removeWalletV2(idWallet);
    res.sendStatus(hasBeenDelete ? 200 : 404);
  }
);

addHandler(
  walletRouter,
  "put",
  appendWalletV1Prefix("/wallet/:idWallet"),
  (req, res) => {
    const idWallet = parseInt(req.params.idWallet, 10);
    const idPsp = req.body.data.idPsp;
    const psp = getPspFromId(idPsp);
    const walletV2 = findWalletById(idWallet);
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
addHandler(
  walletRouter,
  "post",
  appendWalletV1Prefix("/wallet/cc"),
  (_, res) => {
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
  }
);

const checkOutSuffix = "/wallet/loginMethod";
// step 2/3 - credit card
// verification
addHandler(
  walletRouter,
  "post",
  appendWalletV1Prefix("/payments/cc/actions/pay"),
  (_, res) => {
    res.json({
      data: {
        id: faker.datatype.number({ min: 20000, max: 30000 }),
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
  appendWalletV1Prefix(checkOutSuffix),
  (req, res) => {
    res.sendStatus(200);
  }
);

// set a credit card as favourite
addHandler(
  walletRouter,
  "post",
  appendWalletV1Prefix("/wallet/:idWallet/actions/favourite"),
  (req, res) => {
    const walletData = getWalletV2();
    const idWallet = parseInt(req.params.idWallet, 10);
    const paymentMethod = walletData.find(w => w.idWallet === idWallet);
    if (paymentMethod) {
      const favoriteCreditCard = { ...paymentMethod, favourite: true };
      // all wallets different from the favorite and then append it
      const newWalletsData: ReadonlyArray<WalletV2> = [
        ...walletData.filter(w => w.idWallet !== idWallet),
        favoriteCreditCard
      ];
      addWalletV2(newWalletsData, false);
      // a favourite method can be only a CreditCard or PayPal
      const paymentInfo =
        favoriteCreditCard.walletType === WalletTypeEnum.Card
          ? generateWalletV1FromCardInfo(
              favoriteCreditCard.idWallet!,
              favoriteCreditCard.info as CardInfo
            )
          : generateWalletV1FromPayPal(
              favoriteCreditCard.idWallet!,
              favoriteCreditCard.info as PayPalInfo
            );
      // this API requires to return a walletV1
      const walletV1 = {
        ...paymentInfo,
        favourite: true
      };
      res.json({ data: walletV1 });
      return;
    }
    res.sendStatus(404);
  }
);

// update the payment status (enable/disable pay with pagoPA)
addHandler(
  walletRouter,
  "put",
  appendWalletV2Prefix("/wallet/:idWallet/payment-status"),
  (req, res) => {
    const payload = WalletPaymentStatusRequest.decode(req.body);
    // bad request
    if (payload.isLeft()) {
      res.sendStatus(400);
      return;
    }
    const idWallet = parseInt(req.params.idWallet, 10);
    const wallet: WalletV2 | undefined = findWalletById(idWallet);
    // wallet not found
    if (wallet === undefined) {
      res.sendStatus(404);
      return;
    }
    // wallet has not pagoPa flag
    if (
      !(wallet.enableableFunctions ?? []).some(
        ef => ef === EnableableFunctionsEnum.pagoPA
      )
    ) {
      res.sendStatus(400);
      return;
    }
    const updatedWallet: WalletV2 = {
      ...wallet,
      pagoPA: payload.value.data.pagoPA,
      // remove favourite if pagoPA===false
      favourite: !payload.value.data.pagoPA ? false : wallet.favourite
    };
    removeWalletV2(updatedWallet.idWallet!);
    addWalletV2([updatedWallet], true);
    res.json({ data: updatedWallet });
  }
);
