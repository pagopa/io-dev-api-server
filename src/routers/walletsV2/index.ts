import { Router } from "express";
import { AbiListResponse } from "../../../generated/definitions/pagopa/walletv2/AbiListResponse";
import { RestBPayResponse } from "../../../generated/definitions/pagopa/walletv2/RestBPayResponse";
import { RestPanResponse } from "../../../generated/definitions/pagopa/walletv2/RestPanResponse";
import {
  WalletTypeEnum,
  WalletV2
} from "../../../generated/definitions/pagopa/walletv2/WalletV2";
import { WalletV2ListResponse } from "../../../generated/definitions/pagopa/walletv2/WalletV2ListResponse";
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
import { appendWalletV2Prefix } from "../../utils/wallet";

type WalletV2Config = {
  walletBancomat: number;
  walletCreditCard: number;
  walletCreditCardCoBadge: number;
  privative: number;
  satispay: number;
  bPay: number;
  citizenBancomat: number;
  citizenBPay: number;
  citizenCreditCardCoBadge: number;
  citizenSatispay: boolean;
  citizenPrivative: boolean;
};

export const wallet2Router = Router();
export const abiResponse: AbiListResponse = {
  data: abiData
};

export const defaultWalletV2Config: WalletV2Config = {
  walletBancomat: 1,
  walletCreditCard: 1,
  walletCreditCardCoBadge: 1,
  privative: 2,
  satispay: 1,
  bPay: 1,
  citizenSatispay: true,
  citizenBancomat: 3,
  citizenBPay: 3,
  citizenCreditCardCoBadge: 3,
  citizenPrivative: true
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
export let walletV2Response: WalletV2ListResponse = {
  data: []
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
export let walletV2Config: WalletV2Config = defaultWalletV2Config;

export const updateWalletV2Config = (config: WalletV2Config) => {
  walletV2Config = config;
};

// the bancomat owned by the citizen
const citizenBancomat = () =>
  generateCards(
    abiResponse.data ?? [],
    walletV2Config.citizenBancomat,
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
      walletV2Config.citizenBPay
    )
  };

  // add bancomat
  walletBancomat = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletBancomat,
    WalletTypeEnum.Bancomat
  ).map(c =>
    generateWalletV2FromCard(c, WalletTypeEnum.Bancomat, false, ["FA", "BPD"])
  );
  // add credit cards
  walletCreditCards = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletCreditCard,
    WalletTypeEnum.Card
  ).map(c => generateWalletV2FromCard(c, WalletTypeEnum.Card, true));
  // add credit cards co-badge
  walletCreditCardsCoBadges = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletCreditCardCoBadge,
    WalletTypeEnum.Card
  ).map(c =>
    generateWalletV2FromCard(c, WalletTypeEnum.Card, false, ["FA", "BPD"])
  );
  // cobadge owned by the citizen
  citizenCreditCardCoBadge = generateCards(
    abiResponse.data ?? [],
    walletV2Config.citizenCreditCardCoBadge,
    WalletTypeEnum.Card
  ).map(c =>
    generateWalletV2FromCard(c, WalletTypeEnum.Card, false, ["FA", "BPD"])
  );
  // add privative cards
  privativeCards = generateCards(
    abiResponse.data ?? [],
    walletV2Config.privative,
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
  walletSatispay = generateSatispayInfo(walletV2Config.satispay).map(c =>
    generateWalletV2FromSatispayOrBancomatPay(c, WalletTypeEnum.Satispay, [
      "FA",
      "BPD"
    ])
  );
  // add bancomatPay
  walletBancomatPay = generateBancomatPay(
    abiResponse.data ?? [],
    walletV2Config.bPay
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

// return true if wallet relative to the given idWallet has been deleted
export const removeWalletV2 = (idWallet: number): boolean => {
  const wallets = walletV2Response.data ?? [];
  const currentLength = wallets.length;
  const updateWallets = wallets.filter(w => w.idWallet !== idWallet);
  // update wallet Response
  walletV2Response = {
    data: updateWallets
  };
  return updateWallets.length < currentLength;
};

export const findWalletfromId = (idWallet: number): WalletV2 | undefined => {
  const wallets = walletV2Response.data ?? [];
  return wallets.find(w => w.idWallet === idWallet);
};

// return the list of wallets
addHandler(wallet2Router, "get", appendWalletV2Prefix("/wallet"), (_, res) =>
  res.json(walletV2Response)
);

// reset function
export const resetWalletV2 = () => {
  generateWalletV2Data();
};
// at the server startup
generateWalletV2Data();
