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
import {
  WalletTypeEnum,
  WalletV2
} from "../../../../generated/definitions/pagopa/walletv2/WalletV2";
import { assetsFolder } from "../../../global";
import { addHandler } from "../../../payloads/response";
import {
  addWalletV2,
  appendWalletPrefix,
  citizenCreditCardCoBadge,
  walletV2Response
} from "../index";
import { bancomatRouter } from "./bancomat";

const paymentNetworks = Object.values(PaymentNetworkEnum);
const productTypes = Object.values(ProductTypeEnum);
export const cobadgeRouter = Router();

const fromCardInfoToCardBadge = (card: CardInfo): PaymentInstrument => ({
  abiCode: card.issuerAbiCode,
  expiringDate: `01-${card.expireMonth}-${card.expireYear}`,
  hpan: card.hashPan,
  panCode: "123",
  panPartialNumber: card.blurredNumber,
  paymentNetwork: faker.random.arrayElement(paymentNetworks),
  productType: faker.random.arrayElement(productTypes),
  validityStatus: ValidityStatusEnum.VALID,
  tokenMac: "tokenMac"
});

/**
 * return the cobadge list owned by the citizen
 */
addHandler<CobadgeResponse>(
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
    const queryAbi: string | undefined = req.query.abi;
    const paymentInstruments: ReadonlyArray<PaymentInstrument> = citizenCreditCardCoBadge
      .filter(cb =>
        // filter only the card that match the query abi if it is defined
        queryAbi ? queryAbi === (cb.info as CardInfo).issuerAbiCode : true
      )
      .map<PaymentInstrument>(cb =>
        fromCardInfoToCardBadge(cb.info as CardInfo)
      );
    const cobadgeResponse = maybeResponse.value;
    res.status(201).json({
      ...cobadgeResponse,
      payload: { ...cobadgeResponse.payload, paymentInstruments }
    });
  },
  0,
  { codec: CobadgeResponse }
);

/**
 * return the cobadge list owned by the citizen (when pans can't return a response)
 */
addHandler<CobadgeResponse>(
  bancomatRouter,
  "get",
  appendWalletPrefix("/cobadge/search/:searchRequestId"),
  (req, res) => {
    // load the stub and fill it with cobadge cards
    const pansStubData = fs
      .readFileSync(assetsFolder + "/pm/cobadge/search.json")
      .toString();
    const maybeResponse = CobadgeResponse.decode(JSON.parse(pansStubData));
    if (maybeResponse.isLeft()) {
      res.status(400).send(readableReport(maybeResponse.value));
      return;
    }
    const paymentInstruments: ReadonlyArray<PaymentInstrument> = citizenCreditCardCoBadge.map<
      PaymentInstrument
    >(cb => fromCardInfoToCardBadge(cb.info as CardInfo));
    const cobadgeResponse = maybeResponse.value;
    res.json({
      ...cobadgeResponse,
      payload: { ...cobadgeResponse.payload, paymentInstruments }
    });
  },
  0,
  { codec: CobadgeResponse }
);

/**
 * return the cobadge list owned by the citizen (when pans can't return a response)
 */
addHandler<WalletV2>(
  bancomatRouter,
  "post",
  appendWalletPrefix("/cobadge/add-wallets"),
  (req, res) => {
    const data = req.body;
    const maybeData = CobadgeResponse.decode(data);
    // cant decode the body
    if (maybeData.isLeft()) {
      res.status(400).send(readableReport(maybeData.value));
      return;
    }
    // assume the request includes only ONE card
    const paymentInstrument = maybeData.value.payload!.paymentInstruments![0];
    const cobadge = citizenCreditCardCoBadge.find(
      cc => (cc.info as CardInfo).issuerAbiCode === paymentInstrument.abiCode
    );
    if (cobadge === undefined) {
      res.sendStatus(400);
      return;
    }
    const walletData = walletV2Response.data ?? [];
    const walletV2 = walletData.find(
      w =>
        w.info &&
        w.walletType === WalletTypeEnum.Card &&
        (w.info as CardInfo).hashPan === paymentInstrument.hpan
    );
    // already present
    if (walletV2) {
      res.json(walletV2);
      return;
    }
    addWalletV2([cobadge], true);
    res.json(cobadge);
  },
  0,
  { codec: RestPanResponse }
);
