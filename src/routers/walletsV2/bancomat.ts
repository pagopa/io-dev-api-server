import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import fs from "fs";
import * as t from "io-ts";
import { AbiListResponse } from "../../../generated/definitions/pagopa/walletv2/AbiListResponse";
import { BancomatCardsRequest } from "../../../generated/definitions/pagopa/walletv2/BancomatCardsRequest";
import { Card } from "../../../generated/definitions/pagopa/walletv2/Card";
import { Message } from "../../../generated/definitions/pagopa/walletv2/Message";
import { RestPanResponse } from "../../../generated/definitions/pagopa/walletv2/RestPanResponse";
import { WalletTypeEnum } from "../../../generated/definitions/pagopa/walletv2/WalletV2";
import { WalletV2ListResponse } from "../../../generated/definitions/pagopa/walletv2/WalletV2ListResponse";
import { assetsFolder } from "../../global";
import { addHandler } from "../../payloads/response";
import { generateWalletV2FromCard } from "../../payloads/wallet_v2";
import {
  abiResponse,
  addWalletV2,
  appendWalletPrefix,
  pansResponse,
  walletV2Response
} from "../wallet_v2";

export const bancomatRouter = Router();
/**
 * return the banks list
 * if 'abiQuery' is defined in query string a filter on name and abi will be applied
 */
addHandler<AbiListResponse>(
  bancomatRouter,
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
  bancomatRouter,
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
  bancomatRouter,
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
      generateWalletV2FromCard(c, WalletTypeEnum.Bancomat, false)
    );
    addWalletV2([...walletData, ...addedBancomatsWalletV2], false);
    res.json({
      data: bancomatsToAdd.map(c =>
        generateWalletV2FromCard(c, WalletTypeEnum.Bancomat, false)
      )
    });
  }
);
