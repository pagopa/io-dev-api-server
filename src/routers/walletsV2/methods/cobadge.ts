import { Router } from "express";
import faker from "faker/locale/it";
import fs from "fs";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { CardInfo } from "../../../../generated/definitions/pagopa/CardInfo";
import { CobadgeResponse } from "../../../../generated/definitions/pagopa/cobadge/CobadgeResponse";
import {
  PaymentInstrument,
  PaymentNetworkEnum,
  ProductTypeEnum,
  ValidityStatusEnum
} from "../../../../generated/definitions/pagopa/cobadge/PaymentInstrument";
import { RestPanResponse } from "../../../../generated/definitions/pagopa/walletv2/RestPanResponse";
import { assetsFolder } from "../../../global";
import { addHandler } from "../../../payloads/response";
import { appendWalletPrefix, citizenCreditCardCoBadge } from "../index";
import { bancomatRouter } from "./bancomat";

const paymentNetworks = Object.values(PaymentNetworkEnum);
const productTypes = Object.values(ProductTypeEnum);
export const cobadgeRouter = Router();
/**
 * return the cobadge list owned by the citizen
 */
addHandler<RestPanResponse>(
  bancomatRouter,
  "get",
  appendWalletPrefix("/cobadge/pans"),
  (req, res) => {
    // load the stub and fill it with cobadge cards
    const pansStubData = fs
      .readFileSync(assetsFolder + "/pm/cobadge/pans.json")
      .toString();
    const maybeResponse = CobadgeResponse.decode(JSON.parse(pansStubData));
    if (maybeResponse.isLeft()) {
      res.status(400).send(readableReport(maybeResponse.value));
      return;
    }
    const paymentInstruments: ReadonlyArray<PaymentInstrument> = citizenCreditCardCoBadge.map<
      PaymentInstrument
    >(cb => {
      const card = cb.info as CardInfo;
      return {
        abiCode: card.issuerAbiCode,
        expiringDate: `01-${card.expireMonth}-${card.expireYear}`,
        hpan: card.hashPan,
        panCode: "123",
        panPartialNumber: card.blurredNumber,
        paymentNetwork: faker.random.arrayElement(paymentNetworks),
        productType: faker.random.arrayElement(productTypes),
        validityStatus: ValidityStatusEnum.VALID,
        tokenMac: "tokenMac"
      };
    });
    const cobadgeResponse = maybeResponse.value;
    res.json({
      ...cobadgeResponse,
      payload: { ...cobadgeResponse.payload, paymentInstruments }
    });
  },
  0,
  { codec: RestPanResponse }
);
