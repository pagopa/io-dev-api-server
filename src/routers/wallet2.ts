import { Router } from "express";
import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { AbiResponse } from "../../generated/definitions/bpd/pm/bancomat/AbiResponse";
import { installHandler } from "../payloads/response";
import { appendWalletPrefix } from "./wallet";

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
