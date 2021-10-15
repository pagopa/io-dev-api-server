import { Router } from "express";
import { DeletedWalletsResponse } from "../../../generated/definitions/pagopa/DeletedWalletsResponse";
import { AbiListResponse } from "../../../generated/definitions/pagopa/walletv2/AbiListResponse";
import { RestBPayResponse } from "../../../generated/definitions/pagopa/walletv2/RestBPayResponse";
import { RestPanResponse } from "../../../generated/definitions/pagopa/walletv2/RestPanResponse";
import {
  WalletTypeEnum,
  WalletV2
} from "../../../generated/definitions/pagopa/walletv2/WalletV2";
import { WalletV2ListResponse } from "../../../generated/definitions/pagopa/walletv2/WalletV2ListResponse";
import { ioDevServerConfig } from "../../config";
import { addHandler } from "../../payloads/response";
import {
  abiData,
  generateBancomatPay,
  generateCards,
  generatePrivativeFromWalletV2,
  generateSatispayInfo,
  generateWalletV2FromCard,
  generateWalletV2FromSatispayOrBancomatPay,
  privativeIssuers
} from "../../payloads/wallet_v2";
import { WalletMethodConfig } from "../../types/config";
import { appendWalletV2Prefix } from "../../utils/wallet";

export const wallet2Router = Router();
export const abiResponse: AbiListResponse = {
  data: abiData
};

// tslint:disable-next-line: no-let
export let pansResponse: RestPanResponse = {
  data: { data: [], messages: [] } // card array
};

// tslint:disable-next-line: no-let
export let bPayResponse: RestBPayResponse = {
  data: []
};

// tslint:disable-next-line: no-let
let walletV2Response: WalletV2ListResponse = {
  data: []
};

// some utils functions
export const getWalletV2 = (): ReadonlyArray<WalletV2> =>
  walletV2Response.data ?? [];
/**
 * return true if the wallet relative to the given idWallet has been deleted
 * this functions updates the wallets list
 * @param idWallet
 */
export const removeWalletV2 = (idWallet: number): boolean => {
  const wallets = getWalletV2();
  const currentLength = wallets.length;
  const updateWallets = wallets.filter(w => w.idWallet !== idWallet);
  // update wallet Response
  walletV2Response = {
    data: updateWallets
  };
  return updateWallets.length < currentLength;
};

export const findWalletById = (idWallet: number): WalletV2 | undefined => {
  const wallets = getWalletV2();
  return wallets.find(w => w.idWallet === idWallet);
};

// tslint:disable-next-line: no-let
let walletBancomat: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletCreditCards: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletCreditCardsCoBadges: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
export let citizenCreditCardCoBadge: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
export let citizenPrivativeCard: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let privativeCards: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletSatispay: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletBancomatPay: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
export let walletV2Config: WalletMethodConfig =
  ioDevServerConfig.wallet.methods;

export const updateWalletV2Config = (config: WalletMethodConfig) => {
  walletV2Config = config;
};

// the bancomat owned by the citizen
const citizenBancomat = () =>
  generateCards(
    abiResponse.data ?? [],
    walletV2Config.citizenBancomatCount,
    WalletTypeEnum.Bancomat
  );

// add a list of walletv2 to the current ones
export const addWalletV2 = (
  wallets: ReadonlyArray<WalletV2>,
  append: boolean = true
) => {
  if (!append) {
    walletV2Response = { data: wallets };
    return;
  }
  walletV2Response = {
    data: [...wallets, ...(walletV2Response.data ?? [])]
  };
};

export const generateWalletV2Data = () => {
  // bancomat owned by the citizen but not added in his wallet
  pansResponse = {
    data: { data: citizenBancomat() }
  };

  bPayResponse = {
    data: generateBancomatPay(
      abiResponse.data ?? [],
      walletV2Config.citizenBPayCount
    )
  };

  // add bancomat
  walletBancomat = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletBancomatCount,
    WalletTypeEnum.Bancomat
  ).map(c =>
    generateWalletV2FromCard(c, WalletTypeEnum.Bancomat, false, ["FA", "BPD"])
  );
  // add credit cards
  walletCreditCards = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletCreditCardCount,
    WalletTypeEnum.Card
  ).map(c => generateWalletV2FromCard(c, WalletTypeEnum.Card, true));
  // add credit cards co-badge
  walletCreditCardsCoBadges = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletCreditCardCoBadgeCount,
    WalletTypeEnum.Card
  ).map(c =>
    generateWalletV2FromCard(c, WalletTypeEnum.Card, false, ["FA", "BPD"])
  );
  // cobadge owned by the citizen
  citizenCreditCardCoBadge = generateCards(
    abiResponse.data ?? [],
    walletV2Config.citizenCreditCardCoBadgeCount,
    WalletTypeEnum.Card
  ).map(c =>
    generateWalletV2FromCard(c, WalletTypeEnum.Card, false, ["FA", "BPD"])
  );
  // add privative cards
  privativeCards = generateCards(
    abiResponse.data ?? [],
    walletV2Config.privativeCount,
    WalletTypeEnum.Card
  ).map((c, idx) =>
    generatePrivativeFromWalletV2(
      generateWalletV2FromCard(c, WalletTypeEnum.Card, false, ["FA", "BPD"]),
      idx
    )
  );

  citizenPrivativeCard = generateCards(
    abiResponse.data ?? [],
    // if privative is enabled generate a full deck of all privative types
    walletV2Config.citizenPrivative ? privativeIssuers.length : 0,
    WalletTypeEnum.Card
  ).map((c, idx) =>
    generatePrivativeFromWalletV2(
      generateWalletV2FromCard(c, WalletTypeEnum.Card, false, ["FA", "BPD"]),
      idx
    )
  );

  // set a credit card as favorite
  if (walletCreditCards.length > 0) {
    const firstCard = walletCreditCards[0];
    walletCreditCards = [
      ...walletCreditCards.filter(w => w.idWallet !== firstCard.idWallet),
      { ...firstCard, favourite: true }
    ];
  }
  // add satispay
  walletSatispay = generateSatispayInfo(walletV2Config.satispayCount).map(c =>
    generateWalletV2FromSatispayOrBancomatPay(c, WalletTypeEnum.Satispay, [
      "FA",
      "BPD"
    ])
  );
  // add bancomatPay
  walletBancomatPay = generateBancomatPay(
    abiResponse.data ?? [],
    walletV2Config.bPayCount
  ).map(c =>
    generateWalletV2FromSatispayOrBancomatPay(c, WalletTypeEnum.BPay, [
      "FA",
      "BPD"
    ])
  );

  addWalletV2(
    [
      ...privativeCards,
      ...walletBancomat,
      ...walletCreditCards,
      ...walletCreditCardsCoBadges,
      ...walletSatispay,
      ...walletBancomatPay
    ],
    false
  );
};

// return the list of wallets
addHandler(wallet2Router, "get", appendWalletV2Prefix("/wallet"), (_, res) =>
  res.json(walletV2Response)
);

// remove from wallet all these methods that have a specific function enabled (BPD, PagoPA, etc..)
addHandler(
  wallet2Router,
  "delete",
  appendWalletV2Prefix("/wallet/delete-wallets"),
  (req, res) => {
    const service = req.query.service;
    // tslint:disable-next-line: readonly-array
    const deletedWallets: number[] = [];
    const walletsToDelete = getWalletV2().filter(w =>
      (w.enableableFunctions ?? []).includes(service)
    );
    walletsToDelete.forEach(w => {
      const idWallet = w.idWallet ?? -1;
      if (removeWalletV2(idWallet)) {
        deletedWallets.push(idWallet);
      }
    });
    const response: DeletedWalletsResponse = {
      data: {
        deletedWallets: deletedWallets.length,
        notDeletedWallets: walletsToDelete.length - deletedWallets.length
      }
    };
    res.json(response);
  }
);

// reset function
export const resetWalletV2 = () => {
  generateWalletV2Data();
};

// at the server startup
generateWalletV2Data();
