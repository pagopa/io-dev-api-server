import * as faker from "faker/locale/it";
import { index, range } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
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
import { creditCardBrands, getCreditCardLogo } from "../utils/payment";
import { validatePayload } from "../utils/validator";

export const sessionToken: SessionResponse = {
  data: {
    sessionToken: faker.random.alphaNumeric(128)
  }
};

export const validPsp: Psp = {
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
    amount: faker.random.number({ min: 1, max: 150 }),
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

const validPsp2: Psp = {
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
    amount: faker.random.number({ min: 1, max: 250 }),
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

const validPsp3: Psp = {
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
    amount: faker.random.number({ min: 1, max: 250 }),
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

export const pspList: ReadonlyArray<Psp> = [validPsp, validPsp2, validPsp3];
export const getPspFromId = (idPsp: number) =>
  pspList.find(p => p.id === idPsp);

export const getWallets = (count: number = 4): WalletListResponse => {
  // tslint:disable-next-line: no-let
  let walletId = 0;
  // tslint:disable-next-line: no-let
  let creditCardId = 0;
  const generateCreditCard = (): CreditCard => {
    const ccBrand = faker.random.arrayElement(creditCardBrands);
    creditCardId++;
    const expDate = faker.date.future();
    return {
      id: creditCardId,
      brand: ccBrand,
      holder: `${faker.name.firstName()} ${faker.name.lastName()}`,
      pan:
        "************" +
        faker.random
          .number(9999)
          .toString()
          .padStart(4, "0"),
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
  randomData: boolean = true,
  wallets?: ReadonlyArray<Wallet>
): ReadonlyArray<Transaction> => {
  const startId = faker.random.number();
  return range(1, count).map(idx => {
    const amount = randomData
      ? faker.random.number({ min: 100, max: 999999 })
      : 20000 + idx * 10;
    const fee = randomData ? Math.trunc(Math.random() * 150) : 1;
    const description = randomData
      ? `/RFB/${faker.random
          .number(1000000)
          .toString()
          .padStart(17, "0")}/${amount /
          100}/TXT/${faker.finance.transactionDescription()}`
      : `/RFB/02000000000495213/0.01/TXT/${idx} - TEST CAUSALE`;
    const delta = 1000 * 60 * 60;
    const now = new Date();
    const created = randomData
      ? faker.date.past()
      : new Date(now.getTime() + idx * delta);
    const merchant = randomData ? faker.company.companyName() : "merchant";
    return validatePayload(Transaction, {
      // 1 === transaction confirmed!
      accountingStatus: confirmed ? 1 : 0,
      amount: { amount },
      created,
      description,
      error: false,
      fee: { amount: fee },
      grandTotal: { amount: amount + fee },
      id: startId + idx,
      idPayment: 1,
      idPsp: fromNullable(wallets)
        .map(ws => ws[idx % ws.length].idPsp)
        .getOrElse(faker.random.number(10000)),
      idStatus: 3,
      idWallet: fromNullable(wallets)
        .map(ws => ws[idx % ws.length].idWallet)
        .getOrElse(faker.random.number(10000)),
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
