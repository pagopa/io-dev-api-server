import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { CreditCard } from "../../generated/definitions/pagopa/walletv2/CreditCard";
import {
  LinguaEnum,
  Psp
} from "../../generated/definitions/pagopa/walletv2/Psp";
import { SessionResponse } from "../../generated/definitions/pagopa/walletv2/SessionResponse";
import { Transaction } from "../../generated/definitions/pagopa/walletv2/Transaction";
import {
  TypeEnum,
  Wallet
} from "../../generated/definitions/pagopa/walletv2/Wallet";
import { WalletListResponse } from "../../generated/definitions/pagopa/walletv2/WalletListResponse";
import { PaymentConfig } from "../routers/payment";

import { creditCardBrands, getCreditCardLogo } from "../utils/payment";
import { getRandomValue } from "../utils/random";
import { validatePayload } from "../utils/validator";

export const sessionToken: SessionResponse = {
  data: {
    sessionToken: faker.random.alphaNumeric(128)
  }
};

const getAmount = (payment?: PaymentConfig) =>
  getRandomValue(
    payment?.pspFeeAmount,
    faker.datatype.number({ min: 1, max: 150 }),
    "wallet"
  );

export const createValidPsp = (
  payment?: PaymentConfig,
  variant: 1 | 2 | 3 = 1
): Psp => {
  switch (variant) {
    case 1:
      return {
        id: 40000,
        idPsp: "idPsp1",
        businessName: "WHITE bank",
        paymentType: "CP",
        idIntermediary: "idIntermediario1",
        idChannel: "idCanale14",
        logoPSP:
          "https://icons.iconarchive.com/icons/graphicloads/100-flat/256/bank-icon.png",
        serviceLogo:
          "https://icons.iconarchive.com/icons/graphicloads/100-flat/256/bank-icon.png",
        serviceName: "nomeServizio 10 white",
        fixedCost: {
          currency: "EUR",
          amount: getAmount(payment),
          decimalDigits: 2
        },
        appChannel: false,
        tags: ["MAESTRO", "VISA"],
        serviceDescription: "DESCRIZIONE servizio: CP mod1",
        serviceAvailability: "DISPONIBILITA servizio 24/7",
        paymentModel: 1,
        flagStamp: true,
        idCard: 91,
        lingua: "IT" as LinguaEnum
      };
    case 2:
      return {
        id: 40001,
        idPsp: "idPsp1",
        businessName: "Red bank",
        paymentType: "CP",
        idIntermediary: "idIntermediario1",
        idChannel: "idCanale14",
        logoPSP: "https://assets.cdn.io.italia.it/logos/abi/03015.png",
        serviceLogo: "https://assets.cdn.io.italia.it/logos/abi/03015.png",
        serviceName: "nomeServizio 10 red",
        fixedCost: {
          currency: "EUR",
          amount: getAmount(),
          decimalDigits: 2
        },
        appChannel: false,
        tags: ["AMEX"],
        serviceDescription: "DESCRIZIONE servizio: CP mod1",
        serviceAvailability: "DISPONIBILITA servizio 24/7",
        paymentModel: 1,
        flagStamp: true,
        idCard: 91,
        lingua: "IT" as LinguaEnum
      };
    case 3:
      return {
        id: 40002,
        idPsp: "idPsp1",
        businessName: "Blu bank",
        paymentType: "CP",
        idIntermediary: "idIntermediario1",
        idChannel: "idCanale14",
        logoPSP: "https://assets.cdn.io.italia.it/logos/abi/01030.png",
        serviceLogo: "https://assets.cdn.io.italia.it/logos/abi/01030.png",
        serviceName: "nomeServizio 10 Blu",
        fixedCost: {
          currency: "EUR",
          amount: getAmount(),
          decimalDigits: 2
        },
        appChannel: false,
        tags: ["MASTERCARD", "POSTE"],
        serviceDescription: "DESCRIZIONE servizio: CP mod1",
        serviceAvailability: "DISPONIBILITA servizio 24/7",
        paymentModel: 1,
        flagStamp: true,
        idCard: 91,
        lingua: "IT" as LinguaEnum
      };
  }
};

export const createPspList = (payment?: PaymentConfig): ReadonlyArray<Psp> => [
  createValidPsp(payment, 1),
  createValidPsp(payment, 2),
  createValidPsp(payment, 3)
];

export const getPspFromId = (idPsp: number, payment?: PaymentConfig) => {
  const pspList = createPspList(payment);
  pspList.find(p => p.id === idPsp);
};

export const getWallets = (
  count: number = 4,
  payment?: PaymentConfig
): WalletListResponse => {
  // tslint:disable-next-line: no-let
  let walletId = 0;
  // tslint:disable-next-line: no-let
  let creditCardId = 0;
  const generateCreditCard = (): CreditCard => {
    const ccBrand = getRandomValue(
      creditCardBrands[0],
      faker.random.arrayElement(creditCardBrands),
      "wallet"
    );
    creditCardId++;
    const expDate = faker.date.future();
    return {
      id: creditCardId,
      brand: ccBrand,
      holder: `${faker.name.firstName()} ${faker.name.lastName()}`,
      pan:
        "************" +
        getRandomValue(
          faker.datatype
            .number(9999)
            .toString()
            .padStart(4, "0"),
          creditCardId.toString().padStart(4, "0"),
          "wallet"
        ),
      expireMonth: (expDate.getMonth() + 1).toString().padStart(2, "0"),
      expireYear: expDate
        .getFullYear()
        .toString()
        .substr(2),
      brandLogo: getCreditCardLogo(ccBrand),
      flag3dsVerified: true
    };
  };

  const generateWallet = (): Wallet => {
    walletId++;

    const validPsp = createValidPsp(payment);

    return {
      idWallet: walletId,
      type: TypeEnum.CREDIT_CARD,
      favourite: false,
      creditCard: generateCreditCard(),
      // psp: validPsp,
      idPsp: validPsp.id,
      pspEditable: true,
      lastUsage: new Date()
    };
  };

  const data = {
    data: range(1, count).map(generateWallet)
  };

  return validatePayload(WalletListResponse, data);
};

export const getTransactions = (
  count: number,
  confirmed: boolean = true,
  wallets?: ReadonlyArray<Wallet>
): ReadonlyArray<Transaction> => {
  if (wallets?.length === 0) {
    return [];
  }
  return range(1, count).map(idx => {
    const amount = getRandomValue(
      20000 + idx * 10,
      faker.datatype.number({ min: 100, max: 20000 }),
      "wallet"
    );
    const fee = getRandomValue(
      100,
      faker.datatype.number({ min: 1, max: 150 }),
      "wallet"
    );
    const transactionId = getRandomValue(
      idx,
      faker.datatype.number(1000000),
      "wallet"
    );
    const transactionDescription = getRandomValue(
      `transaction - ${idx}`,
      faker.finance.transactionDescription(),
      "wallet"
    );
    const description = `/RFB/${transactionId}/${amount /
      100}/TXT/${transactionDescription}`;
    const delta = 1000 * 60 * 60;
    const now = new Date();
    const created = getRandomValue(
      new Date(now.getTime() + idx * delta),
      faker.date.past(),
      "wallet"
    );
    const merchant = getRandomValue(
      `merchant-${idx}`,
      faker.company.companyName(),
      "wallet"
    );
    return validatePayload(Transaction, {
      // 1 === transaction confirmed!
      accountingStatus: confirmed ? 1 : 0,
      amount: { amount },
      created,
      description,
      error: false,
      fee: { amount: fee },
      grandTotal: { amount: amount + fee },
      id: idx,
      idPayment: 1,
      idPsp: pipe(
        O.fromNullable(wallets),
        O.map(ws => Number(ws[idx % ws.length].idPsp)),
        O.getOrElse(() => faker.datatype.number(10000))
      ),
      idStatus: 3,
      idWallet: pipe(
        O.fromNullable(wallets),
        O.map(ws => ws[idx % ws.length].idWallet),
        O.toUndefined
      ),
      merchant,
      nodoIdPayment: "nodoIdPayment",
      paymentModel: 5,
      spcNodeDescription: "spcNodeDescription",
      spcNodeStatus: 6,
      statusMessage: "statusMessage",
      success: true,
      token: "token",
      updated: undefined,
      urlCheckout3ds: "urlCheckout3ds",
      urlRedirectPSP: "urlRedirectPSP"
    });
  });
};
