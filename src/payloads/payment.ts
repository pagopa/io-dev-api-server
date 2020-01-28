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
import { PspListResponse } from "../../generated/definitions/pagopa/PspListResponse";
import { getPsp } from "./wallet";
import { LinguaEnum } from "../../generated/definitions/pagopa/Psp";

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
  return validatePayload(PspListResponse, data)
  
};
