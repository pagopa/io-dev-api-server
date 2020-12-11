import { Response, Router } from "express";
import faker from "faker/locale/it";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { Iban } from "../../generated/definitions/backend/Iban";
import { PaymentActivationsGetResponse } from "../../generated/definitions/backend/PaymentActivationsGetResponse";
import { PaymentActivationsPostRequest } from "../../generated/definitions/backend/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../../generated/definitions/backend/PaymentActivationsPostResponse";
import { DetailEnum } from "../../generated/definitions/backend/PaymentProblemJson";
import { PaymentResponse } from "../../generated/definitions/pagopa/walletv2/PaymentResponse";
import { fiscalCode } from "../global";
import { addHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import { profileRouter } from "./profile";
import { services } from "./service";
import { walletRouter } from "./wallet";

const walletPath = "/wallet/v1";
const appendWalletPrefix = (path: string) => `${walletPath}${path}`;
export const paymentRouter = Router();

const responseWithError = (detail: DetailEnum, res: Response) =>
  res.status(500).json({
    detail
  });

/**
 * user wants to pay.
 * this is the first step
 * could be:
 * - ko: payment already done
 * - ko: can't get the payment data
 * - ok: payment data updated
 */
addHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/payment-requests/:rptId"),
  // success response: getVerificaSuccess()
  // errore response: getVerificaError(DetailEnum.PAYMENT_DUPLICATED)
  (_, res) => responseWithError(DetailEnum.PAYMENT_DUPLICATED, res)
);

addHandler<PaymentActivationsPostResponse>(
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

addHandler<PaymentActivationsGetResponse>(
  profileRouter,
  "get",
  addApiV1Prefix("/payment-activations/:codiceContestopagamento"),
  (_, res) => {
    const response: PaymentActivationsGetResponse = {
      idPagamento: faker.random.alphaNumeric(30)
    };
    res.json(response);
  }
);

addHandler(
  walletRouter,
  "get",
  appendWalletPrefix("/payments/:idPagamento/actions/check"),
  (_, res) => {
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
    res.json(payment);
  }
);
