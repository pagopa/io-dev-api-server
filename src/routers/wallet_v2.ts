import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import fs from "fs";
import * as t from "io-ts";
import { AbiListResponse } from "../../generated/definitions/pagopa/walletv2/AbiListResponse";
import { BancomatCardsRequest } from "../../generated/definitions/pagopa/walletv2/BancomatCardsRequest";
import { BPayInfo } from "../../generated/definitions/pagopa/walletv2/BPayInfo";
import { BPayRequest } from "../../generated/definitions/pagopa/walletv2/BPayRequest";
import { Card } from "../../generated/definitions/pagopa/walletv2/Card";
import { CardInfo } from "../../generated/definitions/pagopa/walletv2/CardInfo";
import { Message } from "../../generated/definitions/pagopa/walletv2/Message";
import { RestBPayResponse } from "../../generated/definitions/pagopa/walletv2/RestBPayResponse";
import { RestPanResponse } from "../../generated/definitions/pagopa/walletv2/RestPanResponse";
import { RestSatispayResponse } from "../../generated/definitions/pagopa/walletv2/RestSatispayResponse";
import { Satispay } from "../../generated/definitions/pagopa/walletv2/Satispay";
import { SatispayInfo } from "../../generated/definitions/pagopa/walletv2/SatispayInfo";
import {
  WalletTypeEnum,
  WalletV2
} from "../../generated/definitions/pagopa/walletv2/WalletV2";
import { WalletV2ListResponse } from "../../generated/definitions/pagopa/walletv2/WalletV2ListResponse";
import { assetsFolder } from "../global";
import { addHandler } from "../payloads/response";
import {
  abiData,
  generateBancomatPay,
  generateCards,
  generateSatispayInfo,
  generateWalletV2FromCard,
  generateWalletV2FromSatispayOrBancomatPay,
  resetCardConfig,
  satispay
} from "../payloads/wallet_v2";
import { sendFile } from "../utils/file";

type WalletV2Config = {
  walletBancomat: number;
  walletCreditCard: number;
  satispay: number;
  bPay: number;
  citizenBancomat: number;
  citizenBPay: number;
  citizenSatispay: boolean;
};

const walletV1Path = "/wallet/v1";
const appendWalletPrefix = (path: string) => `${walletV1Path}${path}`;
export const wallet2Router = Router();
const walletPath = "/wallet/v2";
const appendWallet2Prefix = (path: string) => `${walletPath}${path}`;
export const abiResponse: AbiListResponse = {
  data: abiData
};

const defaultWalletV2Config: WalletV2Config = {
  walletBancomat: 1,
  walletCreditCard: 1,
  satispay: 1,
  bPay: 1,
  citizenSatispay: true,
  citizenBancomat: 3,
  citizenBPay: 3
};
// tslint:disable-next-line: no-let
let pansResponse: RestPanResponse = {
  data: { data: [], messages: [] } // card array
};

// tslint:disable-next-line: no-let
let bPayResponse: RestBPayResponse = {
  data: []
};

// tslint:disable-next-line: no-let
export let walletV2Response: WalletV2ListResponse = {
  data: []
};
// tslint:disable-next-line: no-let
let walletBancomat: ReadonlyArray<any> = [];
// tslint:disable-next-line: no-let
let walletCreditCards: ReadonlyArray<any> = [];
// tslint:disable-next-line: no-let
let walletSatispay: ReadonlyArray<any> = [];
// tslint:disable-next-line: no-let
let walletBancomatPay: ReadonlyArray<any> = [];
// tslint:disable-next-line: no-let
let walletV2Config = defaultWalletV2Config;

// the bancomat owned by the citizen
const citizenBancomat = () =>
  generateCards(
    abiResponse.data ?? [],
    walletV2Config.citizenBancomat,
    WalletTypeEnum.Bancomat
  );

const generateData = () => {
  // bancomat owned by the citizen but not added in his wallet
  pansResponse = {
    data: { data: citizenBancomat() }
  };

  bPayResponse = {
    data: generateBancomatPay(walletV2Config.citizenBPay)
  };

  // add bancomat
  walletBancomat = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletBancomat,
    WalletTypeEnum.Bancomat
  ).map(c => generateWalletV2FromCard(c, WalletTypeEnum.Bancomat));
  // add credit cards
  walletCreditCards = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletCreditCard,
    WalletTypeEnum.Card
  ).map(c => generateWalletV2FromCard(c, WalletTypeEnum.Card));
  // add satispay
  walletSatispay = generateSatispayInfo(walletV2Config.satispay).map(c =>
    generateWalletV2FromSatispayOrBancomatPay(c, WalletTypeEnum.Satispay)
  );
  // add bancomatPay
  walletBancomatPay = generateBancomatPay(walletV2Config.bPay).map(c =>
    generateWalletV2FromSatispayOrBancomatPay(c, WalletTypeEnum.BPay)
  );

  walletV2Response = {
    data: [
      ...walletBancomat,
      ...walletCreditCards,
      ...walletSatispay,
      ...walletBancomatPay
    ]
  };
};

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

// return the list of wallets
addHandler<WalletV2ListResponse>(
  wallet2Router,
  "get",
  appendWallet2Prefix("/wallet"),
  (_, res) => res.json(walletV2Response)
);

/**
 * return the banks list
 * if 'abiQuery' is defined in query string a filter on name and abi will be applied
 */
addHandler<AbiListResponse>(
  wallet2Router,
  "get",
  appendWalletPrefix("/bancomat/abi"),
  (req, res) => {
    const abiQuery = req.query.abiQuery;
    if (abiQuery !== undefined) {
      const s = abiQuery.toLowerCase().trim();
      return {
        payload: {
          ...abiResponse,
          data: (abiResponse.data ?? []).filter(
            a =>
              a.name!.toLowerCase().indexOf(s) !== -1 ||
              a.abi!.toLowerCase().indexOf(s) !== -1
          )
        }
      };
    }
    res.json(abiResponse);
  }
);

/**
 * return the pans list (bancomat)
 * if 'abi' is defined in query string a filter on abi will be applied
 */
addHandler<RestPanResponse>(
  wallet2Router,
  "get",
  appendWalletPrefix("/bancomat/pans"),
  (req, res) => {
    const abi = req.query.abi;
    const msg = fs
      .readFileSync(assetsFolder + "/pm/pans/messages.json")
      .toString();
    const response = {
      ...pansResponse,
      data: {
        ...pansResponse.data,
        messages: t.readonlyArray(Message).decode(msg).value
      }
    };
    if (abi === undefined) {
      res.json(response);
      return;
    }
    res.json({
      ...response,
      data: {
        data:
          response.data &&
          response.data.data !== undefined &&
          response.data.data.length > 0
            ? response.data.data.filter(c =>
                c.abi ? c.abi.indexOf(abi) !== -1 : false
              )
            : []
      }
    });
  }
);

// add a list of bancomat to the wallet
addHandler<WalletV2ListResponse>(
  wallet2Router,
  "post",
  appendWalletPrefix("/bancomat/add-wallets"),
  (req, res) => {
    const data = req.body;
    const maybeData = BancomatCardsRequest.decode(data);
    // cant decode the body
    if (maybeData.isLeft()) {
      return res.sendStatus(400);
    }
    const walletData = walletV2Response.data ?? [];
    const bancomatsToAdd = maybeData.value.data?.data ?? [];
    // check if a bancomat is already present in the wallet list
    const findBancomat = (card: Card): Card | undefined => {
      return walletData.find(nc =>
        fromNullable(nc)
          .map(v => {
            if (v.info) {
              const info = v.info as any;
              return card.hpan === info.hashPan;
            }
            return false;
          })
          .getOrElse(false)
      );
    };
    // don't add bancomat already present in wallet list (same hpan)
    const addedBancomats = bancomatsToAdd.filter(
      c => findBancomat(c) === undefined
    );
    // transform bancomat to walletv2
    const addedBancomatsWalletV2 = addedBancomats.map(c =>
      generateWalletV2FromCard(c, WalletTypeEnum.Bancomat)
    );
    addWalletV2([...walletData, ...addedBancomatsWalletV2], false);
    res.json({
      data: bancomatsToAdd.map(c =>
        generateWalletV2FromCard(c, WalletTypeEnum.Bancomat)
      )
    });
  }
);

// return the satispay owned by the user
addHandler<RestSatispayResponse>(
  wallet2Router,
  "get",
  appendWalletPrefix("/satispay/consumers"),
  (req, res) => {
    if (walletV2Config.citizenSatispay) {
      res.json({ data: satispay });
      return;
    }
    res.sendStatus(404);
  }
);

// add the given satispay to the wallet
addHandler<RestSatispayResponse>(
  wallet2Router,
  "post",
  appendWalletPrefix("/satispay/add-wallet"),
  (req, res) => {
    const maybeSatispayInfo = Satispay.decode(req.body.data);
    maybeSatispayInfo.fold(
      () => res.sendStatus(400),
      si => {
        const walletData = walletV2Response.data ?? [];
        const walletsWithoutSatispay = walletData.filter(
          w => w.walletType !== WalletTypeEnum.Satispay
        );
        const w2Satispay = generateWalletV2FromSatispayOrBancomatPay(
          { uuid: si.uidSatispayHash },
          WalletTypeEnum.Satispay
        );
        addWalletV2([...walletsWithoutSatispay, w2Satispay], false);
        return res.json({ data: w2Satispay });
      }
    );
  }
);

// add the given list of bpay to the wallet
addHandler<RestSatispayResponse>(
  wallet2Router,
  "post",
  appendWalletPrefix("/bpay/add-wallets"),
  (req, res) => {
    const maybeBPayList = BPayRequest.decode(req.body.data);
    maybeBPayList.fold(
      () => {
        res.sendStatus(400);
      },
      bpay => {
        fromNullable(bpay.data).foldL(
          () => {
            res.sendStatus(400);
          },
          list => {
            const walletData = walletV2Response.data ?? [];
            const walletsWithoutBPay = walletData.filter(
              w => w.walletType !== WalletTypeEnum.BPay
            );
            const w2BpayList = list.map(bp =>
              generateWalletV2FromSatispayOrBancomatPay(bp, WalletTypeEnum.BPay)
            );
            addWalletV2([...walletsWithoutBPay, w2BpayList], false);
            res.json({ data: w2BpayList });
          }
        );
      }
    );
  }
);

// return the bpay owned by the citized
addHandler<RestSatispayResponse>(
  wallet2Router,
  "get",
  appendWalletPrefix("/bpay/list"),
  (req, res) => res.json(bPayResponse)
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
