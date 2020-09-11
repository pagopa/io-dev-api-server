import { range } from "fp-ts/lib/Array";
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

export const getWallets = (): WalletListResponse => {
  const validCreditCard: { [key: string]: any } = {
    id: 1464,
    holder: "Mario Rossi",
    pan: "************0111",
    expireMonth: "05",
    expireYear: "22",
    brandLogo:
      "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
    flag3dsVerified: true
  };

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
    tags: ["MAESTRO"],
    serviceDescription: "DESCRIZIONE servizio: CP mod1",
    serviceAvailability: "DISPONIBILITA servizio 24/7",
    paymentModel: 1,
    flagStamp: true,
    idCard: 91,
    lingua: "IT"
  };

  const WalletCard: Wallet = {
    idWallet: 12345,
    type: TypeEnum.CREDIT_CARD,
    favourite: false,
    creditCard: validCreditCard as CreditCard,
    psp: validPsp as Psp,
    idPsp: validPsp.id,
    pspEditable: true,
    lastUsage: new Date("2018-08-07T15:50:08Z")
  };

  // It is displayed as card!
  const WalletBank: Wallet = {
    idWallet: 67890,
    type: TypeEnum.CREDIT_CARD,
    creditCard: validCreditCard as CreditCard,
    psp: validPsp as Psp,
    idPsp: validPsp.id,
    pspEditable: true,
    lastUsage: new Date("2018-08-07T15:50:08Z")
  };

  // It is displayed as card!
  const WalletBank2: Wallet = {
    idWallet: 67891,
    type: TypeEnum.CREDIT_CARD,
    creditCard: validCreditCard as CreditCard,
    psp: validPsp as Psp,
    idPsp: validPsp.id,
    pspEditable: true,
    lastUsage: new Date("2018-08-07T15:50:08Z")
  };

  const data = {
    data: [WalletBank, WalletCard, WalletBank2]
  };

  return validatePayload(WalletListResponse, data);
};

export const getTransactions = (count: number): ReadonlyArray<Transaction> => {
  const now = new Date();
  const delta = 1000 * 60 * 60; // 1 hour in millisecond
  return range(1, count).map(idx => {
    return validatePayload(Transaction, {
      accountingStatus: 1,
      amount: { amount: 20000 + idx * 10 },
      created: new Date(now.getTime() + idx * delta),
      description: `/RFB/02000000000495213/0.01/TXT/${idx} - TEST CAUSALE`,
      error: false,
      fee: { amount: 1 },
      grandTotal: { amount: 32100 },
      id: idx,
      idPayment: 1,
      idPsp: 43188,
      idStatus: 3,
      idWallet: 12345,
      merchant: "merchant",
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
