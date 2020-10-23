import { Router } from "express";
import { AbiListResponse } from "../../generated/definitions/pagopa/bancomat/AbiListResponse";
import { BancomatCardsRequest } from "../../generated/definitions/pagopa/bancomat/BancomatCardsRequest";
import { Card } from "../../generated/definitions/pagopa/bancomat/Card";
import { RestPanResponse } from "../../generated/definitions/pagopa/bancomat/RestPanResponse";
import { WalletsV2Response } from "../../generated/definitions/pagopa/bancomat/WalletsV2Response";
import { installCustomHandler, installHandler } from "../payloads/response";
import {
  generateAbiData,
  generateCards,
  generateWalletV2
} from "../payloads/wallet_v2";
import { toPayload } from "../utils/validator";
import { appendWalletPrefix } from "./wallet";
import { WalletV2ListResponse } from "../../generated/definitions/pagopa/bancomat/WalletV2ListResponse";
import { range } from "fp-ts/lib/Array";

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

const defaultCards = generateCards(abiResponse.data ?? [], 3);
// tslint:disable-next-line
let pansResponse: RestPanResponse = {
  data: defaultCards
};

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
    if (abi === undefined) {
      return toPayload(pansResponse);
    }
    return toPayload({
      ...pansResponse,
      data:
        pansResponse.data !== undefined && pansResponse.data.length > 0
          ? pansResponse.data.filter(c =>
              c.abi ? c.abi.indexOf(abi) !== -1 : false
            )
          : []
    });
  }
);

// tslint:disable-next-line
let walletV2Response: WalletV2ListResponse = {
  data: []
};

installCustomHandler<WalletsV2Response>(
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
    // keep from current cars those one different from the new ones
    const keptData = (pansResponse.data ?? []).filter(d =>
      (maybeData.value.data ?? []).some(dd => dd.hpan !== d.hpan)
    );
    const newPans: ReadonlyArray<Card> = maybeData.value.data ?? [];
    pansResponse = {
      data: [...keptData, ...newPans]
    };
    walletV2Response = {
      data: [
        ...(walletV2Response.data ?? []),
        ...newPans.map(c => generateWalletV2(c))
      ]
    };
    res.json(walletV2Response);
  }
);

installHandler<WalletV2ListResponse>(
  wallet2Router,
  "get",
  appendWallet2Prefix("/wallet"),
  _ => toPayload(walletV2Response),
  WalletV2ListResponse
);
