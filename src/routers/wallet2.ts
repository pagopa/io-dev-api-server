import { Router } from "express";
import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { Abi } from "../../generated/definitions/bpd/pm/bancomat/Abi";
import { AbiResponse } from "../../generated/definitions/bpd/pm/bancomat/AbiResponse";
import {
  Card,
  ProductTypeEnum,
  ValidityStateEnum
} from "../../generated/definitions/bpd/pm/bancomat/Card";
import { Cards } from "../../generated/definitions/bpd/pm/bancomat/Cards";
import { installHandler } from "../payloads/response";
import { toPayload } from "../utils/validator";
import { appendWalletPrefix } from "./wallet";

export const wallet2Router = Router();

const abisData = range(1, 500).map<Abi>(idx => ({
  abi: idx.toString().padStart(5, "0"),
  name: faker.company.companyName(),
  logoUrl: faker.image.imageUrl(64, 64)
}));

const abiResponse: AbiResponse = {
  data: abisData
};

installHandler<AbiResponse>(
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

      expiringDate: `${ed.getFullYear()}-${(ed.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${ed
        .getDate()
        .toString()
        .padStart(2, "0")}`,

      productType: ProductTypeEnum.PP,

      tokens: ["token1", "token2"],

      validityState: ValidityStateEnum.V
    };
  });
};

const cards: Cards = {
  data: cardsData(abiResponse.data!)
};

installHandler<Cards>(
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
