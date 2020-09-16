import * as faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import { CreditCard } from "../../generated/definitions/pagopa/CreditCard";
import { Psp } from "../../generated/definitions/pagopa/Psp";
import { SessionResponse } from "../../generated/definitions/pagopa/SessionResponse";
import { Transaction } from "../../generated/definitions/pagopa/Transaction";
import { TypeEnum, Wallet } from "../../generated/definitions/pagopa/Wallet";
import { WalletListResponse } from "../../generated/definitions/pagopa/WalletListResponse";
import { validatePayload } from "../utils/validator";

export const sessionToken: SessionResponse = {
  data: {
    sessionToken:
      "3m3Q2h6e8T5w9t3W8b8y1F4t2m6Q9b8d9N6h1f2H2u0g6E7m9d9E3g7w3T3b5a7I4c4h6U4n2b3Z4p3j8D6p4a5G1c4a8K3o0v8P7e0j6R5i1y2J6d0c7N9i6m0U3j9z"
  }
};

export const getWallets = (count: number = 4): WalletListResponse => {
  const validAmount: { [key: string]: any } = {
    currency: "EUR",
    amount: 1000,
    decimalDigits: 2
  };

  const validPsp: { [key: string]: any } = {
    id: 43188,
    idPsp: "idPsp1",
    businessName: "WHITE bank",
    paymentType: "CP",
    idIntermediary: "idIntermediario1",
    idChannel: "idCanale14",
    logoPSP: "https://wisp2.pagopa.gov.it/pp-restapi/v2/resources/psp/1578833",
    serviceLogo:
      "https://wisp2.pagopa.gov.it/pp-restapi/v2/resources/service/1578833",
    serviceName: "nomeServizio 10 white",
    fixedCost: validAmount,
    appChannel: false,
    tags: ["MAESTRO", "VISA"],
    serviceDescription: "DESCRIZIONE servizio: CP mod1",
    serviceAvailability: "DISPONIBILITA servizio 24/7",
    paymentModel: 1,
    flagStamp: true,
    idCard: 91,
    lingua: "IT"
  };

  const cclogos: ReadonlyArray<string> = ["mc", "visa", "maestro", "amex"];
  // tslint:disable-next-line: no-let
  let walletId = 0;
  // tslint:disable-next-line: no-let
  let creditCardId = 0;
  const generateCreditCard = (): CreditCard => {
    const logoIndex = Math.trunc(Math.random() * 1000) % cclogos.length;
    creditCardId++;
    const expDate = faker.date.future();
    return {
      id: creditCardId,
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
      brandLogo: `https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_${cclogos[logoIndex]}.png`,
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
      psp: validPsp as Psp,
      idPsp: validPsp.id,
      pspEditable: true,
      lastUsage: new Date()
    };
  };

  // It is displayed as card!
  const WalletBank: Wallet = {
    idWallet: 67890,
    type: TypeEnum.BANK_ACCOUNT,
    creditCard: generateCreditCard(),
    psp: validPsp as Psp,
    idPsp: validPsp.id,
    pspEditable: true,
    lastUsage: new Date("2018-08-07T15:50:08Z")
  };

  const data = {
    data: [...range(1, count).map(generateWallet), WalletBank]
  };

  return validatePayload(WalletListResponse, data);
};

export const getTransactions = (
  count: number,
  wallets?: ReadonlyArray<Wallet>
): ReadonlyArray<Transaction> => {
  return range(1, count).map(idx => {
    const amount = Math.trunc(Math.random() * 100 * 1000);
    const fee = Math.trunc(Math.random() * 150);
    return validatePayload(Transaction, {
      accountingStatus: 1,
      amount: { amount },
      created: faker.date.past(),
      description: `/RFB/${faker.random
        .number(1000000)
        .toString()
        .padStart(17, "0")}/${amount / 100}/TXT/${faker.company.catchPhrase()}`,
      error: false,
      fee: { amount: fee },
      grandTotal: { amount: amount + fee },
      id: idx,
      idPayment: 1,
      idPsp: fromNullable(wallets)
        .map(ws => ws[idx % ws.length].idPsp)
        .getOrElse(faker.random.number(10000)),
      idStatus: 3,
      idWallet: fromNullable(wallets)
        .map(ws => ws[idx % ws.length].idWallet)
        .getOrElse(faker.random.number(10000)),
      merchant: faker.company.companyName(),
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
