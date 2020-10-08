import { Router } from "express";
import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import sha256 from "sha256";
import { Abi } from "../../generated/definitions/pagopa/Abi";
import { AbiListResponse } from "../../generated/definitions/pagopa/AbiListResponse";
import {
  Card,
  ProductTypeEnum,
  ValidityStateEnum
} from "../../generated/definitions/pagopa/Card";
import { RestPanResponse } from "../../generated/definitions/pagopa/RestPanResponse";
import { installHandler } from "../payloads/response";
import { toPayload } from "../utils/validator";
import { appendWalletPrefix } from "./wallet";

export const wallet2Router = Router();

const abisData = range(1, 500).map<Abi>(idx => ({
  abi: idx.toString().padStart(5, "0"),
  name: faker.company.companyName(),
  logoUrl: faker.image.imageUrl(64, 64)
}));

const abiResponse: AbiListResponse = {
  data: abisData
};

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
          data: abisData.filter(
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
const cardCount = 10;
const cardsData = (abis: ReadonlyArray<Abi>) => {
  // tslint:disable-next-line
  const shuffledAbis = faker.helpers.shuffle(abis as Abi[]);
  return range(1, Math.min(cardCount, abis.length)).map<Card>((_, idx) => {
    const cn = faker.finance.creditCardNumber();
    const ed = faker.date.future();
    return {
      abi: shuffledAbis[idx].abi,
      cardNumber: cn,
      cardPartialNumber: cn.substr(cn.lastIndexOf("-") + 1).substr(0, 4),
      expiringDate: ed,
      hpan: sha256(cn),
      productType: ProductTypeEnum.PP,
      tokens: ["token1", "token2"],
      validityState: ValidityStateEnum.V
    };
  });
};

const cards: RestPanResponse = {
  data: cardsData(abiResponse.data!)
};

installHandler<RestPanResponse>(
  wallet2Router,
  "get",
  appendWalletPrefix("/bancomat/pans"),
  req => {
    const abi = req.query.abi;
    if (abi === undefined) {
      return toPayload(cards);
    }
    return toPayload({
      ...cards,
      data:
        cards.data !== undefined
          ? cards.data.filter(c => (c.abi ? c.abi.indexOf(abi) !== -1 : false))
          : []
    });
  }
);
