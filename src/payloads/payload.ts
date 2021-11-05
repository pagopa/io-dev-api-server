import faker from "faker/locale/it";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { CodiceContestoPagamento } from "../../generated/definitions/backend/CodiceContestoPagamento";
import { Iban } from "../../generated/definitions/backend/Iban";
import { ImportoEuroCents } from "../../generated/definitions/backend/ImportoEuroCents";
import { PaymentActivationsGetResponse } from "../../generated/definitions/backend/PaymentActivationsGetResponse";
import { PaymentActivationsPostResponse } from "../../generated/definitions/backend/PaymentActivationsPostResponse";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { PaymentRequestsGetResponse } from "../../generated/definitions/backend/PaymentRequestsGetResponse";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { SpezzoneStrutturatoCausaleVersamento } from "../../generated/definitions/backend/SpezzoneStrutturatoCausaleVersamento";
import { Payment } from "../../generated/definitions/pagopa/walletv2/Payment";
import { PaymentResponse } from "../../generated/definitions/pagopa/walletv2/PaymentResponse";
import { LinguaEnum } from "../../generated/definitions/pagopa/walletv2/Psp";
import { PspListResponseCD as PspListResponse } from "../../generated/definitions/pagopa/walletv2/PspListResponseCD";
import { PspResponse } from "../../generated/definitions/pagopa/walletv2/PspResponse";
import { ioDevServerConfig } from "../config";
import { validatePayload } from "../utils/validator";

import { validPsp } from "./wallet";

type settings = {
  user: string;
  userCf: string;
  messagesNumber: number;
  servicesNumber: number;
  baseNoticeNumber: string;
  serverPort: number;
};

export const settings: settings = {
  user: "mario",
  userCf: "RSSMRA83A12H501D",
  messagesNumber: 20,
  servicesNumber: 10,
  baseNoticeNumber: "012345678999999999",
  serverPort: 3000
};

export type paymentItem = {
  idTransaction: number;
  status: string;
};

export const getNoticeNumber = (paymentNumber: number): string => {
  const messageNumber = paymentNumber.toString();
  const newStr = settings.baseNoticeNumber.substring(
    0,
    settings.baseNoticeNumber.length - messageNumber.length
  );
  return newStr + messageNumber;
};

export const getRandomNoticeNumber = (): string => {
  const randomNumber = Math.floor(Math.random() * settings.messagesNumber);
  const messageNumber = randomNumber.toString();
  const newStr = settings.baseNoticeNumber.substring(
    0,
    settings.baseNoticeNumber.length - messageNumber.length
  );

  return newStr + messageNumber;
};

export const paymentData = {
  paymentNoticeNumber: getRandomNoticeNumber() as PaymentNoticeNumber,
  organizationFiscalCode: "01199250158" as OrganizationFiscalCode,
  importoSingoloVersamento: 1 as ImportoEuroCents, // = 1 eurocent
  codiceContestoPagamento: "03314e90321011eaa22f931313a0ec7c" as CodiceContestoPagamento,
  ibanAccredito: "IT00V0000000000000000000000" as Iban,
  causaleVersamento: "Avviso di prova app IO",
  enteBeneficiario: {
    identificativoUnivocoBeneficiario: "01199250158" as OrganizationFiscalCode,
    denominazioneBeneficiario: "Comune di Milano"
  },
  spezzoniCausaleVersamento: {
    spezzoneCausaleVersamento: "causale versamento di prova" as SpezzoneStrutturatoCausaleVersamento
  },
  idPagamento: "ca7d9be4-7da1-442d-92c6-d403d7361f65",
  origin: "CITTADINANZA_DIGITALE",
  id: 12882164,
  urlRedirectEc:
    "http://mespaprod.soluzionipa.it/pagamenti?idSession=118a22f4-86d4-42d8-992c-7aead5ac8ed3&idDominio=01199250158", // link su piattaforma ente,
  psps: [
    { ...validPsp, lingua: LinguaEnum.IT },
    { ...validPsp, lingua: LinguaEnum.IT },
    { ...validPsp, lingua: LinguaEnum.IT }
  ],
  amount: {
    amount: 1 as ImportoEuroCents, // = 1 eurocent,
    currency: "EUR",
    decimalDigits: 2
  }
};

export const getValidPsp = (idPsp: number): PspResponse => {
  const psp = {
    data: {
      id: idPsp,
      idPsp: "CIPBITMM",
      businessName: "Nexi",
      paymentType: "CP",
      idIntermediary: "13212880150",
      idChannel: "13212880150_02_ONUS",
      logoPSP:
        "https://acardste.vaservices.eu/pp-restapi/v3/resources/psp/406319",
      serviceLogo:
        "https://acardste.vaservices.eu/pp-restapi/v3/resources/service/406319",
      serviceName: "Pagamento con carta",
      fixedCost: {
        currency: "EUR",
        amount: 250,
        decimalDigits: 2
      },
      appChannel: false,
      tags: ["VISA", "MASTERCARD", "MAESTRO", "VISA_ELECTRON"],
      serviceDescription:
        "The service allows you to make payments to the PA using Nexi cards on the Visa, VPAY, Mastercard and Maestro channels.",
      serviceAvailability: "Operating 24 hours a day, seven days a week",
      urlInfoChannel:
        "https://www.bancaimpresa.pagamentipa.test.nexi.it/agidpa_portal/CIPBITMM_jsp/PaginaInformativaICBPI.jsp?lang=eng",
      paymentModel: 1,
      flagStamp: false,
      idCard: 551,
      lingua: "EN",
      codiceAbi: "05000",
      isPspOnus: true
    }
  };

  return validatePayload(PspResponse, psp);
};

// Response /actions/pay api
export const payResponse = {
  data: {
    id: 7090047996,
    created: new Date("2020-02-07T08:43:38Z"),
    updated: new Date("2020-02-07T08:43:38Z"),
    amount: {
      currency: "EUR",
      amount: 1,
      decimalDigits: 2
    },
    grandTotal: {
      currency: "EUR",
      amount: 51,
      decimalDigits: 2
    },
    description: "/RFB/719094842555711/0.01/TXT/Avviso di prova app IO",
    merchant: "Comune di Milano",
    idStatus: 0,
    statusMessage: "Da autorizzare",
    error: false,
    success: false,
    fee: {
      currency: "EUR",
      amount: 50,
      decimalDigits: 2
    },
    urlCheckout3ds:
      "https://acardste.vaservices.eu/wallet/checkout?id=NzA5MDA0Nzk5Ng==",
    paymentModel: 0,
    token: "NzA5MDA0Nzk5Ng==",
    idWallet: 38404,
    idPsp: 401162,
    idPayment: 71144,
    nodoIdPayment: "9fca64d0-921f-432a-b214-361f44f98eac",
    orderNumber: 7090047996
  }
};

// Response /transactions/idTransaction
export const transactionIdResponseFirst = {
  data: {
    id: 7090047996,
    created: new Date("2020-02-07T08:43:38Z"),
    updated: new Date("2020-02-07T08:43:38Z"),
    amount: {
      currency: "EUR",
      amount: 1,
      decimalDigits: 2
    },
    grandTotal: {
      currency: "EUR",
      amount: 51,
      decimalDigits: 2
    },
    description: "/RFB/719094842555711/0.01/TXT/Avviso di prova app IO",
    merchant: "Comune di Milano",
    idStatus: 0,
    statusMessage: "Da autorizzare",
    error: false,
    success: false,
    fee: {
      currency: "EUR",
      amount: 50,
      decimalDigits: 2
    },
    token: "NzA5MDA0ODAwNQ==",
    idWallet: 38404,
    idPsp: 401164,
    idPayment: 71156,
    nodoIdPayment: "e7a7aab0-9f2c-49d2-b5c4-3897d1a90f3a",
    orderNumber: 7090048009
  }
};

// Response /transactions/idTransaction
export const transactionIdResponseSecond = {
  data: {
    id: 7090047996,
    created: new Date("2020-02-07T08:43:38Z"),
    updated: new Date("2020-02-07T08:43:38Z"),
    amount: {
      currency: "EUR",
      amount: 1,
      decimalDigits: 2
    },
    grandTotal: {
      currency: "EUR",
      amount: 51,
      decimalDigits: 2
    },
    description: "/RFB/719094842555711/0.01/TXT/Avviso di prova app IO",
    merchant: "Comune di Milano",
    idStatus: 3,
    statusMessage: "Confermato",
    error: false,
    success: true,
    fee: {
      currency: "EUR",
      amount: 50,
      decimalDigits: 2
    },
    token: "NzA5MDA0ODAwOQ==",
    idWallet: 38404,
    idPsp: 401164,
    idPayment: 71160,
    nodoIdPayment: "375daf96-d8e6-42fb-b095-4e3c270923ad",
    spcNodeStatus: 0,
    accountingStatus: 1,
    authorizationCode: "00",
    orderNumber: 7090048009,
    rrn: "200380002021",
    numAut: "431061"
  }
};

export const getPaymentRequestsGetResponse = (
  senderService: ServicePublic
): PaymentRequestsGetResponse => ({
  importoSingoloVersamento:
    (ioDevServerConfig.wallet.payment
      .amount as PaymentRequestsGetResponse["importoSingoloVersamento"]) ??
    (faker.datatype.number({
      min: 1,
      max: 9999
    }) as PaymentRequestsGetResponse["importoSingoloVersamento"]),
  codiceContestoPagamento: faker.random.alphaNumeric(
    32
  ) as PaymentRequestsGetResponse["codiceContestoPagamento"],
  ibanAccredito: faker.finance.iban() as PaymentRequestsGetResponse["ibanAccredito"],
  causaleVersamento: faker.finance.transactionDescription(),
  enteBeneficiario: {
    identificativoUnivocoBeneficiario: senderService.organization_fiscal_code,
    denominazioneBeneficiario: senderService.organization_name
  },
  spezzoniCausaleVersamento: [
    {
      spezzoneCausaleVersamento: faker.commerce.product()
    }
  ]
});

export const getPaymentActivationsPostResponse = (): PaymentActivationsPostResponse => {
  const data: PaymentActivationsPostResponse = {
    importoSingoloVersamento: paymentData.importoSingoloVersamento,
    ibanAccredito: paymentData.ibanAccredito,
    causaleVersamento: paymentData.causaleVersamento,
    enteBeneficiario: paymentData.enteBeneficiario
  };
  return validatePayload(PaymentActivationsPostResponse, data);
};

export const getPaymentActivationsGetResponse = (): PaymentActivationsGetResponse => {
  const data = {
    idPagamento: paymentData.idPagamento
  };
  return validatePayload(PaymentActivationsGetResponse, data);
};

export const getPaymentResponse = (): PaymentResponse => {
  const payment: Payment = {
    amount: paymentData.amount,
    bolloDigitale: false,
    fiscalCode: paymentData.organizationFiscalCode,
    id: paymentData.id,
    idPayment: paymentData.idPagamento,
    isCancelled: true,
    origin: paymentData.origin,
    receiver: paymentData.enteBeneficiario.denominazioneBeneficiario,
    subject: paymentData.causaleVersamento,
    urlRedirectEc: paymentData.urlRedirectEc
  };

  const data: PaymentResponse = {
    data: payment
  };
  return validatePayload(PaymentResponse, data);
};

export const getPspList = () => {
  const data: PspListResponse = {
    data: paymentData.psps
  };
  return validatePayload(PspListResponse, data);
};

// tslint:disable-next-line: readonly-array
export const getPaymentsArray = (): paymentItem[] => {
  const localStorage = {} as any;
  const paymentsStorage = localStorage.getItem("payments");
  const paymentsArray =
    paymentsStorage !== null ? JSON.parse(paymentsStorage) : { payments: [] };
  return paymentsArray.payments;
};

export const getPaymentStatus = (idTransaction: number | undefined): string => {
  if (idTransaction === undefined) {
    return "";
  }
  const payments = getPaymentsArray();
  const mPayment = payments.filter(p => {
    return p.idTransaction === idTransaction;
  });
  return mPayment.length > 0
    ? mPayment[0].status !== undefined
      ? mPayment[0].status
      : ""
    : "";
};

export const setPayment = (
  idTransaction: number | undefined,
  status: string | undefined
) => {
  if (idTransaction !== undefined) {
    const payments = getPaymentsArray();
    const payment: paymentItem = {
      idTransaction,
      status: status !== undefined ? status : ""
    };
    const alreadyExist = payments.filter(p => {
      return p.idTransaction === idTransaction;
    });
    if (alreadyExist[0] === undefined || alreadyExist.length < 1) {
      payments.push(payment);
      const localStorage = {} as any;
      localStorage.setItem("payments", JSON.stringify({ payments }));
    }
  }
};
