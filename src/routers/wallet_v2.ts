import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import fs from "fs";
import * as t from "io-ts";
import { AbiListResponse } from "../../generated/definitions/pagopa/walletv2/AbiListResponse";
import { BancomatCardsRequest } from "../../generated/definitions/pagopa/walletv2/BancomatCardsRequest";
import { Card } from "../../generated/definitions/pagopa/walletv2/Card";
import { CardInfo } from "../../generated/definitions/pagopa/walletv2/CardInfo";
import {
  CaNameEnum,
  Message
} from "../../generated/definitions/pagopa/walletv2/Message";
import { RestPanResponse } from "../../generated/definitions/pagopa/walletv2/RestPanResponse";
import { WalletTypeEnum } from "../../generated/definitions/pagopa/walletv2/WalletV2";
import { WalletV2ListResponse } from "../../generated/definitions/pagopa/walletv2/WalletV2ListResponse";
import { assetsFolder } from "../global";
import { installCustomHandler, installHandler } from "../payloads/response";
import {
  generateAbiData,
  generateCards,
  generateWalletV2,
  resetCardConfig
} from "../payloads/wallet_v2";
import { sendFile } from "../utils/file";
import { toPayload } from "../utils/validator";
import { appendWalletPrefix } from "./wallet";

export const wallet2Router = Router();
const walletPath = "/wallet/v2";
const appendWallet2Prefix = (path: string) => `${walletPath}${path}`;
const abiResponse: AbiListResponse = {
  data: generateAbiData(500, false)
};

/**
 * return the banks list
 * if 'abiQuery' is defined in query string a filter on name and abi will be applied
 */
installHandler<AbiListResponse>(
  wallet2Router,
  "get",
  appendWalletPrefix("/bancomat/abi"),
  req => {
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
    return { payload: abiResponse };
  }
);

type WalletV2Config = {
  walletBancomat: number;
  walletCreditCard: number;
  citizenBancomat: number;
};

const defaultWalletV2Config: WalletV2Config = {
  walletBancomat: 2,
  walletCreditCard: 1,
  citizenBancomat: 3
};
// tslint:disable-next-line
let walletV2Config = defaultWalletV2Config;

const citizenBancomat = () =>
  generateCards(
    abiResponse.data ?? [],
    walletV2Config.citizenBancomat,
    WalletTypeEnum.Bancomat
  );

// tslint:disable-next-line
let pansResponse: RestPanResponse = {
  data: [] // card array
};
// tslint:disable-next-line
let walletBancomat = [];
// tslint:disable-next-line
let walletV2Response: WalletV2ListResponse = {
  data: []
};
// tslint:disable-next-line
let walletCreditCards = [];

const generateData = () => {
  // messages are read from a json on response
  pansResponse = {
    data: { data: citizenBancomat() }
  };
  walletBancomat = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletBancomat,
    WalletTypeEnum.Bancomat
  ).map(c => generateWalletV2(c, WalletTypeEnum.Bancomat));
  walletCreditCards = generateCards(
    abiResponse.data ?? [],
    walletV2Config.walletCreditCard,
    WalletTypeEnum.Card
  ).map(c => generateWalletV2(c, WalletTypeEnum.Card));
  walletV2Response = {
    data: [...walletBancomat, ...walletCreditCards]
  };
};
generateData();
/**
 * return the pans list (bancomat)
 * if 'abi' is defined in query string a filter on abi will be applied
 */
installHandler<RestPanResponse>(
  wallet2Router,
  "get",
  appendWalletPrefix("/bancomat/pans"),
  req => {
    const abi = req.query.abi;
    const msg = JSON.parse(
      fs.readFileSync(assetsFolder + "/pm/pans/messages.json").toString()
    );
    const response = {
      ...pansResponse,
      messages: t.readonlyArray(Message).decode(msg).value
    };
    if (abi === undefined) {
      return toPayload(response);
    }
    return toPayload({
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
  },
  { codec: RestPanResponse }
);

installCustomHandler<WalletV2ListResponse>(
  wallet2Router,
  "post",
  appendWalletPrefix("/bancomat/add-wallets"),
  (req, res) => {
    const data = req.body;
    const maybeData = BancomatCardsRequest.decode(data);
    // cant decode the body
    if (maybeData.isLeft()) {
      return res.sendStatus(403);
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
    // don't add bancomats already present in wallet list (same hpan)
    const addedBancomats = bancomatsToAdd.filter(
      c => findBancomat(c) === undefined
    );
    // transform bancomat to walletv2
    const addedBancomatsWalletV2 = addedBancomats.map(c =>
      generateWalletV2(c, WalletTypeEnum.Bancomat)
    );
    walletV2Response = {
      data: [...walletData, ...addedBancomatsWalletV2]
    };
    res.json({
      data: bancomatsToAdd.map(c =>
        generateWalletV2(c, WalletTypeEnum.Bancomat)
      )
    });
  }
);

installHandler<WalletV2ListResponse>(
  wallet2Router,
  "get",
  appendWallet2Prefix("/wallet"),
  _ => toPayload(walletV2Response),
  { codec: WalletV2ListResponse }
);

// reset function
export const resetWalletV2 = () => {
  generateData();
};

// get walletv2-bpd (dashboard web)
installCustomHandler(
  wallet2Router,
  "get",
  "/walletv2-bpd",
  (_, res) => sendFile("assets/html/wallet2_config.html", res),
  "WalletV2 config dashboard"
);

// get walletv2-bpd config (dashboard web)
installCustomHandler(wallet2Router, "get", "/walletv2/config", (_, res) =>
  res.json(walletV2Config)
);

// update walletv2-bpd config (dashboard web)
installCustomHandler(wallet2Router, "post", "/walletv2/config", (req, res) => {
  walletV2Config = req.body;
  resetCardConfig();
  generateData();
  res.json(walletV2Config);
});

export const getBPDPaymentMethod = () =>
  (walletV2Response.data ?? [])
    .filter(w => (w.enableableFunctions ?? []).some(ef => ef === "BPD"))
    .map(bpd => ({
      hpan: (bpd.info as CardInfo).hashPan,
      pan: (bpd.info as CardInfo).blurredNumber,
      type: bpd.walletType
    }));

// get the hpans of walletv2 that support BPD (dashboard web)
installCustomHandler(wallet2Router, "get", "/walletv2/bpd-pans", (req, res) => {
  res.json(getBPDPaymentMethod());
});

// reset walletv2-bpd config (dashboard web)
installCustomHandler(wallet2Router, "get", "/walletv2/reset", (_, res) => {
  walletV2Config = defaultWalletV2Config;
  generateData();
  res.json(walletV2Config);
});
