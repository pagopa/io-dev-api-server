import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import fs from "fs";
import * as t from "io-ts";
import { AbiListResponse } from "../../../generated/definitions/pagopa/walletv2/AbiListResponse";
import { BancomatCardsRequest } from "../../../generated/definitions/pagopa/walletv2/BancomatCardsRequest";
import { BPay } from "../../../generated/definitions/pagopa/walletv2/BPay";
import { BPayInfo } from "../../../generated/definitions/pagopa/walletv2/BPayInfo";
import { BPayRequest } from "../../../generated/definitions/pagopa/walletv2/BPayRequest";
import { Card } from "../../../generated/definitions/pagopa/walletv2/Card";
import { CardInfo } from "../../../generated/definitions/pagopa/walletv2/CardInfo";
import { Message } from "../../../generated/definitions/pagopa/walletv2/Message";
import { RestBPayResponse } from "../../../generated/definitions/pagopa/walletv2/RestBPayResponse";
import { RestPanResponse } from "../../../generated/definitions/pagopa/walletv2/RestPanResponse";
import { SatispayInfo } from "../../../generated/definitions/pagopa/walletv2/SatispayInfo";
import { WalletResponse } from "../../../generated/definitions/pagopa/walletv2/WalletResponse";
import {
  WalletTypeEnum,
  WalletV2
} from "../../../generated/definitions/pagopa/walletv2/WalletV2";
import { WalletV2ListResponse } from "../../../generated/definitions/pagopa/walletv2/WalletV2ListResponse";
import { assetsFolder } from "../../global";
import { addHandler } from "../../payloads/response";
import {
  abiData,
  generateBancomatPay,
  generateCards,
  generateSatispayInfo,
  generateWalletV1FromCardInfo,
  generateWalletV2FromCard,
  generateWalletV2FromSatispayOrBancomatPay,
  resetCardConfig
} from "../../payloads/wallet_v2";
import { sendFile } from "../../utils/file";

type WalletV2Config = {
  walletBancomat: number;
  walletCreditCard: number;
  walletCreditCardCoBadge: number;
  satispay: number;
  bPay: number;
  citizenBancomat: number;
  citizenBPay: number;
  citizenSatispay: boolean;
};

const walletV1Path = "/wallet/v1";
export const appendWalletPrefix = (path: string) => `${walletV1Path}${path}`;
export const wallet2Router = Router();
const walletPath = "/wallet/v2";
const appendWallet2Prefix = (path: string) => `${walletPath}${path}`;
export const abiResponse: AbiListResponse = {
  data: abiData
};

const defaultWalletV2Config: WalletV2Config = {
  walletBancomat: 1,
  walletCreditCard: 1,
  walletCreditCardCoBadge: 1,
  satispay: 1,
  bPay: 1,
  citizenSatispay: true,
  citizenBancomat: 3,
  citizenBPay: 3
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
let walletSatispay: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
let walletBancomatPay: ReadonlyArray<WalletV2> = [];
// tslint:disable-next-line: no-let
export let walletV2Config = defaultWalletV2Config;

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

const generateData = () => {
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
  ).map(c => generateWalletV2FromCard(c, WalletTypeEnum.Bancomat, false));
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
  ).map(c => generateWalletV2FromCard(c, WalletTypeEnum.Card, false));
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
    generateWalletV2FromSatispayOrBancomatPay(c, WalletTypeEnum.Satispay)
  );
  // add bancomatPay
  walletBancomatPay = generateBancomatPay(
    abiResponse.data ?? [],
    walletV2Config.bPay
  ).map(c => generateWalletV2FromSatispayOrBancomatPay(c, WalletTypeEnum.BPay));

  addWalletV2(
    [
      ...walletBancomat,
      ...walletCreditCards,
      ...walletCreditCardsCoBadges,
      ...walletSatispay,
      ...walletBancomatPay
    ],
    false
  );
};

// return true if the given idWallet can be deleted
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

export const getWallet = (idWallet: number): WalletV2 | undefined => {
  const wallets = walletV2Response.data ?? [];
  return wallets.find(w => w.idWallet === idWallet);
};

// return the list of wallets
addHandler<WalletV2ListResponse>(
  wallet2Router,
  "get",
  appendWallet2Prefix("/wallet"),
  (_, res) => res.json(walletV2Response)
);

// wallet/v1/wallet/21530/actions/favourite
// set a credit card as favourite
addHandler<WalletResponse>(
  wallet2Router,
  "post",
  appendWalletPrefix("/wallet/:idWallet/actions/favourite"),
  (req, res) => {
    const walletData = walletV2Response.data ?? [];
    const idWallet = parseInt(req.params.idWallet, 10);
    const creditCard = walletData.find(w => w.idWallet === idWallet);
    if (creditCard) {
      const favoriteCreditCard = { ...creditCard, favourite: true };
      // all wallets different from the favorite and then append it
      const newWalletsData: ReadonlyArray<WalletV2> = [
        ...walletData.filter(w => w.idWallet !== idWallet),
        favoriteCreditCard
      ];
      addWalletV2(newWalletsData, false);
      // this API requires to return a walletV1
      const walletV1 = {
        ...generateWalletV1FromCardInfo(
          favoriteCreditCard.idWallet!,
          favoriteCreditCard.info as CardInfo
        ),
        favourite: true
      };
      return res.json({ data: walletV1 });
    }
    res.sendStatus(404);
  }
);

// reset function
export const resetWalletV2 = () => {
  generateData();
};
generateData();

// DASHBOARD config API / utility functions

// get walletv2-bpd (dashboard web)
addHandler(
  wallet2Router,
  "get",
  "/",
  (_, res) => sendFile("assets/html/wallet2_config.html", res),
  0,
  { description: "WalletV2 config dashboard" }
);

// get walletv2-bpd config (dashboard web)
addHandler(wallet2Router, "get", "/walletv2/config", (_, res) =>
  res.json(walletV2Config)
);

// update walletv2-bpd config (dashboard web)
addHandler(wallet2Router, "post", "/walletv2/config", (req, res) => {
  walletV2Config = req.body;
  resetCardConfig();
  generateData();
  res.json(walletV2Config);
});

// get all payment methods compliant with BPD (dashboard web)
export const getBPDPaymentMethod = () =>
  (walletV2Response.data ?? [])
    .filter(w => (w.enableableFunctions ?? []).some(ef => ef === "BPD"))
    .map(bpd => {
      if (
        bpd.walletType === WalletTypeEnum.Card ||
        bpd.walletType === WalletTypeEnum.Bancomat
      ) {
        return {
          hpan: (bpd.info as CardInfo).hashPan,
          pan: (bpd.info as CardInfo).blurredNumber,
          type: bpd.walletType
        };
      }
      if (bpd.walletType === WalletTypeEnum.Satispay) {
        return {
          hpan: (bpd.info as SatispayInfo).uuid,
          pan: "--",
          type: bpd.walletType
        };
      }
      if (bpd.walletType === WalletTypeEnum.BPay) {
        return {
          hpan: (bpd.info as BPayInfo).uidHash,
          pan: "--",
          type: bpd.walletType
        };
      }
      return {
        hpan: "--",
        pan: "--",
        type: bpd.walletType
      };
    });

// get the hpans of walletv2 that support BPD (dashboard web)
addHandler(wallet2Router, "get", "/walletv2/bpd-pans", (req, res) => {
  res.json(getBPDPaymentMethod());
});

// reset walletv2-bpd config (dashboard web)
addHandler(wallet2Router, "get", "/walletv2/reset", (_, res) => {
  walletV2Config = defaultWalletV2Config;
  generateData();
  res.json(walletV2Config);
});
