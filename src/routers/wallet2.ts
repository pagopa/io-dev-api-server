import { Router } from "express";
import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { AbiResponse } from "../../generated/definitions/bpd/pm/bancomat/AbiResponse";
import { installHandler } from "../payloads/response";
import { appendWalletPrefix } from "./wallet";
import { Cards } from "../../generated/definitions/bpd/pm/bancomat/Cards";
import { Abi } from "../../generated/definitions/bpd/pm/bancomat/Abi";
import {
  Card,
  ProductTypeEnum,
  ValidityStateEnum
} from "../../generated/definitions/bpd/pm/bancomat/Card";
import * as t from "io-ts";
import { PatternString } from "italia-ts-commons/lib/strings";
import { enumType } from "italia-ts-commons/lib/types";
import { toPayload } from "../utils/validator";

export const wallet2Router = Router();

const abisData = range(1, 500).map(idx => ({
  abi: idx.toString().padStart(5, "0"),
  name: faker.company.companyName(),
  logoUrl: faker.image.imageUrl(64, 64)
}));

const abis: AbiResponse = {
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
          ...abis,
          data: abisData.filter(
            a =>
              a.name.toLowerCase().indexOf(s) !== -1 ||
              a.abi.toLowerCase().indexOf(s) !== -1
          )
        }
      };
    }
    return { payload: abis };
  }
);

const cardsData = range(1, 10).map<Card>(_ => {
  const cn = faker.finance.creditCardNumber();
  const ed = faker.date.future();
  return {
    abi: faker.random
      .number(500)
      .toString()
      .padStart(5, "0"),

    cardNumber: cn,

    cardPartialNumber: cn.substr(cn.lastIndexOf("-") + 1).substr(0, 4),

    expiringDate: `${ed.getFullYear()}-${ed
      .getMonth()
      .toString()
      .padStart(2, "0")}-${ed
      .getDate()
      .toString()
      .padStart(2, "0")}`,

    productType: ProductTypeEnum.PP,

    tokens: ["token1", "token2"],

    validityState: ValidityStateEnum.BR
  };
});

const cards: Cards = {
  data: cardsData
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
