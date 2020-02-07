import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { CodiceContestoPagamento } from "../../generated/definitions/backend/CodiceContestoPagamento";
import { Iban } from "../../generated/definitions/backend/Iban";
import { ImportoEuroCents } from "../../generated/definitions/backend/ImportoEuroCents";
import { PaymentActivationsGetResponse } from "../../generated/definitions/backend/PaymentActivationsGetResponse";
import { PaymentActivationsPostResponse } from "../../generated/definitions/backend/PaymentActivationsPostResponse";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { PaymentRequestsGetResponse } from "../../generated/definitions/backend/PaymentRequestsGetResponse";
import { RptId } from "../../generated/definitions/backend/RptId";
import { SpezzoneStrutturatoCausaleVersamento } from "../../generated/definitions/backend/SpezzoneStrutturatoCausaleVersamento";
import { validatePayload } from "../utils/validator";
import { PaymentResponse } from "../../generated/definitions/pagopa/PaymentResponse";
import { Payment } from "../../generated/definitions/pagopa/Payment";
import { PspListResponseCD as PspListResponse } from "../../generated/definitions/pagopa/PspListResponseCD";
import { getPsp } from "./wallet";
import { LinguaEnum } from "../../generated/definitions/pagopa/Psp";
import { TransactionResponse } from "../../generated/definitions/pagopa/TransactionResponse";

export const paymentData = {
  paymentNoticeNumber: "012345678912345678" as PaymentNoticeNumber,
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
  idPagamento:  "ca7d9be4-7da1-442d-92c6-d403d7361f65",
  origin: "CITTADINANZA_DIGITALE",
  id: 12882164,
  urlRedirectEc: "http://mespaprod.soluzionipa.it/pagamenti?idSession=118a22f4-86d4-42d8-992c-7aead5ac8ed3&idDominio=01199250158", // link su piattaforma ente,
  psps: [getPsp(LinguaEnum.IT), getPsp(LinguaEnum.EN) ],
  amount: {
    amount: 1 as ImportoEuroCents, // = 1 eurocent,
    currency: "EUR",
    decimalDigits: 2
}
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
    urlCheckout3ds: "https://acardste.vaservices.eu/wallet/checkout?id=NzA5MDA0Nzk5Ng==",
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

const rptId = RptId.decode(paymentData);
const delocalizedAmount = "0.01";

export const getPaymentRequestsGetResponse = () => {
  const data = {
    importoSingoloVersamento: paymentData.importoSingoloVersamento,
    codiceContestoPagamento: paymentData.codiceContestoPagamento,
    ibanAccredito: paymentData.ibanAccredito,
    causaleVersamento: paymentData.causaleVersamento,
    enteBeneficiario: paymentData.enteBeneficiario,
    spezzoniCausaleVersamento: [paymentData.spezzoniCausaleVersamento]
  };

  return validatePayload(PaymentRequestsGetResponse, data);
};

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
    return validatePayload(PaymentActivationsGetResponse, data)
}

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
    return validatePayload(PaymentResponse, data)
}

export const getPspList = () => {
  const data: PspListResponse = {
      data: paymentData.psps
  };
  return validatePayload(PspListResponse, data);
  
};

export const getPayResponse = () => {
  return validatePayload(TransactionResponse, payResponse);
};

export const getTransactionResponseFirst = () => {
  return validatePayload(TransactionResponse, transactionIdResponseFirst);
};

export const getTransactionResponseSecond = () => {
  return validatePayload(TransactionResponse, transactionIdResponseSecond);
};
