import { Router } from "express";
import { PaymentActivationsPostRequest } from "../../generated/definitions/backend/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../../generated/definitions/backend/PaymentActivationsPostResponse";
import {
  DetailEnum,
  PaymentProblemJson
} from "../../generated/definitions/backend/PaymentProblemJson";
import { getPaymentRequestsGetResponse } from "../payloads/payload";
import {
  installCustomHandler,
  installHandler,
  IOResponse
} from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import { profileRouter } from "./profile";
import faker from "faker/locale/it";
import { Iban } from "../../generated/definitions/backend/Iban";
import { services } from "./service";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { PaymentActivationsGetResponse } from "../../generated/definitions/backend/PaymentActivationsGetResponse";
import { toPayload } from "../utils/validator";
import { appendWalletPrefix, walletRouter } from "./wallet";
import { PaymentResponse } from "../../generated/definitions/pagopa/bancomat/PaymentResponse";
import { fiscalCode } from "../global";

export const paymentRouter = Router();

const getVerificaError = (
  detail: DetailEnum
): IOResponse<PaymentProblemJson> => ({
  payload: {
    status: 500,
    detail
  },
  status: 500
});

const getVerificaSuccess = () => ({ payload: getPaymentRequestsGetResponse() });

// verifica
installHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/payment-requests/:rptId"),
  // success response: getVerificaSuccess()
  // errore response: getVerificaError(DetailEnum.PAYMENT_DUPLICATED)
  () => getVerificaSuccess()
);

installCustomHandler<PaymentActivationsPostResponse>(
  profileRouter,
  "post",
  addApiV1Prefix("/payment-activations"),
  (req, res) => {
    const payload = PaymentActivationsPostRequest.decode(req.body);
    if (payload.isRight()) {
      const activation = payload.value;
      const service = faker.random.arrayElement(services);
      const description = faker.finance.transactionDescription();
      const response: PaymentActivationsPostResponse = {
        importoSingoloVersamento: activation.importoSingoloVersamento,
        causaleVersamento: description,
        ibanAccredito: faker.finance.iban() as Iban,
        enteBeneficiario: {
          identificativoUnivocoBeneficiario: service.organization_fiscal_code,
          denominazioneBeneficiario: service.organization_name
        }
      };
      res.json(response);
    } else {
      res.sendStatus(403);
    }
  }
);

installHandler<PaymentActivationsGetResponse>(
  profileRouter,
  "get",
  addApiV1Prefix("/payment-activations/:codiceContestopagamento"),
  () => {
    const response: PaymentActivationsGetResponse = {
      idPagamento: faker.random.alphaNumeric(30)
    };
    return toPayload(response);
  }
);

installHandler(
  walletRouter,
  "get",
  appendWalletPrefix("/payments/:idPagamento/actions/check"),
  _ => {
    const payment: PaymentResponse = {
      data: {
        id: faker.random.number(),
        idPayment: faker.random.alphaNumeric(30),
        amount: {
          currency: "EUR",
          amount: faker.random.number({ min: 1, max: 2000 }),
          decimalDigits: 2
        },
        subject: "/RFB/01343520000005561/32.00",
        receiver: "Provincia di Viterbo",
        urlRedirectEc:
          "https://solutionpa-coll.intesasanpaolo.com/IntermediarioPAPortal/noauth/contribuente/pagamentoEsito?idSession=ad095398-2863-4951-b2b6-400ff8d8e95b&idDominio=80005570561",
        isCancelled: false,
        bolloDigitale: false,
        fiscalCode: fiscalCode as FiscalCode,
        origin: "CITTADINANZA_DIGITALE",
        iban: faker.finance.iban()
      }
    };
    return toPayload(payment);
  }
);
