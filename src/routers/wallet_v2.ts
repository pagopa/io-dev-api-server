import { Router } from "express";
import { AbiListResponse } from "../../generated/definitions/pagopa/bancomat/AbiListResponse";
import { BancomatCardsRequest } from "../../generated/definitions/pagopa/bancomat/BancomatCardsRequest";
import { RestPanResponse } from "../../generated/definitions/pagopa/bancomat/RestPanResponse";
import { WalletsV2Response } from "../../generated/definitions/pagopa/bancomat/WalletsV2Response";
import { installCustomHandler, installHandler } from "../payloads/response";
import { generateAbiData, generateCards } from "../payloads/wallet_v2";
import { toPayload } from "../utils/validator";
import { appendWalletPrefix } from "./wallet";

export const wallet2Router = Router();

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
    const newPans = maybeData.value.data ?? [];
    pansResponse = {
      data: [...(pansResponse.data ?? []), ...newPans]
    };
    res.json(newPans);
  }
);
