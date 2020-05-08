import { range } from "fp-ts/lib/Array";
import ip from "ip";
import { LocalStorage } from "node-localstorage";
import { CreditCard } from "../../generated/definitions/pagopa/CreditCard";
import { LinguaEnum, Psp } from "../../generated/definitions/pagopa/Psp";
import { SessionResponse } from "../../generated/definitions/pagopa/SessionResponse";
import { Transaction } from "../../generated/definitions/pagopa/Transaction";
import { TransactionListResponse } from "../../generated/definitions/pagopa/TransactionListResponse";
import { TransactionResponse } from "../../generated/definitions/pagopa/TransactionResponse";
import { TypeEnum, Wallet } from "../../generated/definitions/pagopa/Wallet";
import { WalletResponse } from "../../generated/definitions/pagopa/WalletResponse";
import { settings } from "../settings";
import { capitalizeFirstLetter } from "../utils/string";
import { validatePayload } from "../utils/validator";

export const sessionToken: SessionResponse = {
  data: {
    sessionToken:
      "3m3Q2h6e8T5w9t3W8b8y1F4t2m6Q9b8d9N6h1f2H2u0g6E7m9d9E3g7w3T3b5a7I4c4h6U4n2b3Z4p3j8D6p4a5G1c4a8K3o0v8P7e0j6R5i1y2J6d0c7N9i6m0U3j9z"
  }
};

export const getPsp = (locales: LinguaEnum.IT | LinguaEnum.EN): Psp => {
  return {
    id: locales === LinguaEnum.IT ? 1713322 : 1713323,
    idPsp: "UNCRITMM",
    businessName: "UniCredit S.p.A",
    paymentType: "CP",
    idIntermediary: "00348170101",
    idChannel: "00348170101_01_ONUS",
    logoPSP: "https://wisp2.pagopa.gov.it/pp-restapi/v2/resources/psp/1713322",
    serviceLogo:
      "https://wisp2.pagopa.gov.it/pp-restapi/v2/resources/service/1713322",
    serviceName: "Pagamento con carte",
    fixedCost: {
      currency: "EUR",
      amount: 95,
      decimalDigits: 2
    },
    appChannel: false,
    tags: ["VISA", "MASTERCARD", "MAESTRO"],
    serviceDescription:
      "Il Servizio consente di effettuare pagamenti con carte emesse a valere sui circuiti VISA, MASTERCARD,MAESTRO",
    serviceAvailability:
      "Il Servizio è disponibile on line h24, 7 giorni su 7. Sono consentite operazioni di pagamento fino ad un limite massimo di € 1000 ciascuna",
    urlInfoChannel: "https://www.unicredit.it/it/privati.html",
    paymentModel: 1,
    flagStamp: false,
    idCard: 2535,
    lingua: locales,
    codiceAbi: "02008",
    isPspOnus: true
  };
};

const walletResponse = {
  data: {
    idWallet: 38605,
    type: "CREDIT_CARD",
    favourite: false,
    creditCard: {
      id: 30573,
      holder: "Alice Rossi",
      pan: "************2505",
      expireMonth: "12",
      expireYear: "22",
      brandLogo:
        "https://acardste.vaservices.eu/wallet/assets/img/creditcard/carta_mc.png",
      flag3dsVerified: false,
      brand: "MASTERCARD",
      onUs: true
    },
    psp: {
      id: 403321,
      idPsp: "BCITITMM",
      businessName: "Intesa Sanpaolo S.p.A",
      paymentType: "CP",
      idIntermediary: "00799960158",
      idChannel: "00799960158_01_ONUS",
      logoPSP:
        "https://acardste.vaservices.eu/pp-restapi/v3/resources/psp/403321",
      serviceLogo:
        "https://acardste.vaservices.eu/pp-restapi/v3/resources/service/403321",
      serviceName: "Pagamento con Carte",
      fixedCost: {
        currency: "EUR",
        amount: 50,
        decimalDigits: 2
      },
      appChannel: false,
      tags: ["VISA", "MASTERCARD"],
      serviceDescription:
        "Clienti e non delle Banche del Gruppo Intesa Sanpaolo possono disporre pagamenti con carte di pagamento VISA-MASTERCARD",
      serviceAvailability: "7/7-24H",
      paymentModel: 1,
      flagStamp: true,
      idCard: 437,
      lingua: "IT",
      codiceAbi: "03069",
      isPspOnus: true
    },
    idPsp: 403321,
    pspEditable: true,
    isPspToIgnore: false
  }
};

export const getValidWalletResponse: WalletResponse = validatePayload(
  WalletResponse,
  walletResponse
);

const walletFavouriteResponse = (idCard: number) => {
  return {
    data: {
      idWallet: idCard,
      type: "CREDIT_CARD",
      favourite: true,
      creditCard: {
        id: 30573,
        holder: "Alice Rossi",
        pan: "************2505",
        expireMonth: "12",
        expireYear: "22",
        brandLogo:
          "https://acardste.vaservices.eu/wallet/assets/img/creditcard/carta_mc.png",
        flag3dsVerified: false,
        brand: "MASTERCARD",
        onUs: true
      },
      psp: {
        id: 403321,
        idPsp: "BCITITMM",
        businessName: "Intesa Sanpaolo S.p.A",
        paymentType: "CP",
        idIntermediary: "00799960158",
        idChannel: "00799960158_01_ONUS",
        logoPSP:
          "https://acardste.vaservices.eu/pp-restapi/v3/resources/psp/403321",
        serviceLogo:
          "https://acardste.vaservices.eu/pp-restapi/v3/resources/service/403321",
        serviceName: "Pagamento con Carte",
        fixedCost: {
          currency: "EUR",
          amount: 50,
          decimalDigits: 2
        },
        appChannel: false,
        tags: ["VISA", "MASTERCARD"],
        serviceDescription:
          "Clienti e non delle Banche del Gruppo Intesa Sanpaolo possono disporre pagamenti con carte di pagamento VISA-MASTERCARD",
        serviceAvailability: "7/7-24H",
        paymentModel: 1,
        flagStamp: true,
        idCard: 437,
        lingua: "IT",
        codiceAbi: "03069",
        isPspOnus: true
      },
      idPsp: 403321,
      pspEditable: true,
      isPspToIgnore: false
    }
  };
};

export const getValidFavouriteResponse = (idCard: number): WalletResponse =>
  validatePayload(WalletResponse, walletFavouriteResponse(idCard));

export const getValidWalletCCResponse = (idWallet: number): WalletResponse => {
  const walletCCResponse = {
    data: {
      idWallet,
      type: "CREDIT_CARD",
      favourite: false,
      creditCard: {
        id: 30757,
        holder: `${capitalizeFirstLetter(settings.user)} Rossi`,
        pan: `************${idWallet}`,
        expireMonth: "05",
        expireYear: "22",
        brandLogo:
          "https://acardste.vaservices.eu/wallet/assets/img/creditcard/carta_mc.png",
        flag3dsVerified: false,
        brand: "MASTERCARD",
        onUs: true
      },
      psp: {
        id: 406309,
        idPsp: "CIPBITMM",
        businessName: "Nexi",
        paymentType: "CP",
        idIntermediary: "13212880150",
        idChannel: "13212880150_02_ONUS",
        logoPSP:
          "https://acardste.vaservices.eu/pp-restapi/v3/resources/psp/406309",
        serviceLogo:
          "https://acardste.vaservices.eu/pp-restapi/v3/resources/service/406309",
        serviceName: "Pagamento con carta",
        fixedCost: {
          currency: "EUR",
          amount: 100,
          decimalDigits: 2
        },
        appChannel: false,
        tags: ["VISA", "MASTERCARD", "MAESTRO", "VISA_ELECTRON"],
        serviceDescription:
          "Il Servizio consente di eseguire pagamenti a favore delle PA con carte Nexi sui circuiti Visa, VPAY, Mastercard e Maestro.",
        serviceAvailability: "24 ore su 24, 7 giorni su 7",
        urlInfoChannel:
          "https://www.bancaimpresa.pagamentipa.test.nexi.it/agidpa_portal/CIPBITMM_jsp/PaginaInformativaICBPI.jsp?lang=ita",
        paymentModel: 1,
        flagStamp: false,
        idCard: 541,
        lingua: "IT",
        codiceAbi: "05000",
        isPspOnus: true
      },
      idPsp: 406309,
      pspEditable: true,
      isPspToIgnore: false
    }
  };
  return validatePayload(WalletResponse, walletCCResponse);
};
export const getValidActionPayCC = (idWallet: number): TransactionResponse => {
  const walletCCActionsPay = {
    data: {
      id: 7090048346,
      created: "2020-02-14T10:27:14Z",
      updated: "2020-02-14T10:27:14Z",
      amount: {
        currency: "EUR",
        amount: 1,
        decimalDigits: 2
      },
      grandTotal: {
        currency: "EUR",
        amount: 2,
        decimalDigits: 2
      },
      description: "SET_SUBJECT",
      merchant: "",
      idStatus: 0,
      statusMessage: "Da autorizzare",
      error: false,
      success: false,
      fee: {
        currency: "EUR",
        amount: 100,
        decimalDigits: 2
      },
      urlCheckout3ds: `http://${ip.address()}:${
        settings.serverPort
      }/wallet/checkout?id=NzA5MDA0ODM0Ng==`,
      paymentModel: 0,
      token: "NzA5MDA0ODM0Ng==",
      idWallet,
      idPsp: 406309,
      idPayment: 71692,
      nodoIdPayment: "3fd36e66-edd5-42a1-a1fb-b933bcdb3a84",
      orderNumber: 7090048346
    }
  };

  return validatePayload(TransactionResponse, walletCCActionsPay);
};

const validPsp = getPsp(LinguaEnum.EN);

const getValidCreditCard = (
  id: number,
  holder: string = `${capitalizeFirstLetter(settings.user)} Rossi`,
  pan: string,
  expireMonth: string = "05",
  expireYear: string = "22",
  brand: string = "MASTERCARD",
  brandLogo: string = "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_mc.png",
  flag3dsVerified: boolean = true
  // tslint:disable-next-line: parameters-max-number
): CreditCard => {
  return {
    id,
    holder,
    pan: `************${pan}`,
    expireMonth,
    expireYear,
    brand,
    brandLogo,
    flag3dsVerified
  };
};

// tslint:disable-next-line: readonly-array
export const getWalletArray = (): Wallet[] => {
  const localStorage = new LocalStorage("./scratch");
  const walletsStorage = localStorage.getItem("wallets");
  const walletsArray =
    walletsStorage !== null ? JSON.parse(walletsStorage) : { wallets: [] };
  return walletsArray.wallets;
};

export const getWallet = (
  idWallet: number,
  holder: string = `${capitalizeFirstLetter(settings.user)} Rossi`,
  expireMonth: string | number = "05",
  expireYear: string | number = "22"
): Wallet => {
  const brand = idWallet !== 2222 ? "MASTERCARD" : "MAESTRO";

  // tslint:disable-next-line: readonly-array
  const wallet = {
    idWallet,
    type: TypeEnum.CREDIT_CARD,
    favourite: idWallet === 2222,
    creditCard: getValidCreditCard(
      1464,
      holder,
      `${idWallet}`,
      `${expireMonth}`,
      `${expireYear}`,
      brand,
      `https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/${
        brand === "MASTERCARD" ? "carta_mc" : "carta_maestro"
      }.png`,
      true
    ),
    psp: validPsp,
    idPsp: validPsp.id,
    pspEditable: true,
    lastUsage: new Date("2018-08-07T15:50:08Z")
  };

  return validatePayload(Wallet, wallet);
};

export const getTransactions = (count: number): ReadonlyArray<Transaction> => {
  return range(1, count).map(idx => {
    return validatePayload(Transaction, {
      accountingStatus: 1,
      amount: { amount: 20000 },
      created: new Date(2018, 10, 30, 13, 12, 22, 30),
      description: `hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world`,
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
