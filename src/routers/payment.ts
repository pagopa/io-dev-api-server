import { Response, Router } from "express";
import faker from "faker/locale/it";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { Iban } from "../../generated/definitions/backend/Iban";
import { PaymentActivationsGetResponse } from "../../generated/definitions/backend/PaymentActivationsGetResponse";
import { PaymentActivationsPostRequest } from "../../generated/definitions/backend/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../../generated/definitions/backend/PaymentActivationsPostResponse";
import { DetailEnum } from "../../generated/definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../generated/definitions/backend/PaymentRequestsGetResponse";
import { PaymentResponse } from "../../generated/definitions/pagopa/walletv2/PaymentResponse";
import { fiscalCode } from "../global";
import { getPaymentRequestsGetResponse } from "../payloads/payload";
import { addHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import { profileRouter } from "./profile";
import { services } from "./service";
import { walletRouter } from "./wallet";
import { getTransactions, validPsp } from "../payloads/wallet";
const walletPath = "/wallet/v1";
const appendWalletPrefix = (path: string) => `${walletPath}${path}`;
export const paymentRouter = Router();

const responseWithError = (detail: DetailEnum, res: Response) =>
  res.status(500).json({
    detail
  });

// tslint:disable-next-line: no-let
let paymentRequest: PaymentRequestsGetResponse | undefined;
// tslint:disable-next-line: no-let
let idPagamento: string | undefined;
/**
 * user wants to pay (VERIFICA)
 * this API return the current status of the payment
 * this is the first step
 * could be:
 * - ko: payment already done
 * - ko: can't get the payment data
 * - ok: payment data updated
 * STEP 1
 */
addHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/payment-requests/:rptId"),
  // success response: res.json(getPaymentRequestsGetResponse(faker.random.arrayElement(services))))
  // error response: responseWithError(DetailEnum.PAYMENT_DUPLICATED, res)
  (_, res) => {
    paymentRequest = getPaymentRequestsGetResponse(
      faker.random.arrayElement(services)
    );
    res.json(paymentRequest);
  }
);

/**
 * the user wants to lock this payment (ATTIVA)
 * this API return the
 * STEP 2
 */
addHandler<PaymentActivationsPostResponse>(
  profileRouter,
  "post",
  addApiV1Prefix("/payment-activations"),
  (req, res) => {
    if (paymentRequest === undefined) {
      res.sendStatus(404);
      return;
    }
    const payload = PaymentActivationsPostRequest.decode(req.body);
    if (payload.isRight()) {
      const response: PaymentActivationsPostResponse = {
        importoSingoloVersamento: paymentRequest.importoSingoloVersamento,
        causaleVersamento: paymentRequest.causaleVersamento,
        ibanAccredito: faker.finance.iban() as Iban,
        enteBeneficiario: paymentRequest.enteBeneficiario
      };
      res.json(response);
    } else {
      res.sendStatus(403);
    }
  }
);

/**
 * the user wants to lock this payment (ATTIVA)
 * the app stats a polling using codiceContestoPagamento as input
 * when the payment is finally locked this API returns the idPagamento
 * STEP 3
 */
addHandler<PaymentActivationsGetResponse>(
  profileRouter,
  "get",
  addApiV1Prefix("/payment-activations/:codiceContestopagamento"),
  (_, res) => {
    idPagamento = faker.random.alphaNumeric(30);
    const response: PaymentActivationsGetResponse = {
      idPagamento: faker.random.alphaNumeric(30)
    };
    res.json(response);
  }
);

/**
 * user gets info about payment starting from paymentID
 * this is a checks to ensure the payment activated through IO is now availbale also in the PM
 * STEP 4
 */
addHandler(
  walletRouter,
  "get",
  appendWalletPrefix("/payments/:idPagamento/actions/check"),
  (_, res) => {
    if (idPagamento === undefined || paymentRequest === undefined) {
      res.sendStatus(404);
      return;
    }
    const payment: PaymentResponse = {
      data: {
        id: faker.random.number(),
        idPayment: idPagamento,
        amount: {
          currency: "EUR",
          amount: paymentRequest.importoSingoloVersamento,
          decimalDigits: 2
        },
        subject: "/RFB/01343520000005561/32.00",
        receiver: paymentRequest.causaleVersamento,
        urlRedirectEc:
          "https://solutionpa-coll.intesasanpaolo.com/IntermediarioPAPortal/noauth/contribuente/pagamentoEsito?idSession=ad095398-2863-4951-b2b6-400ff8d8e95b&idDominio=80005570561",
        isCancelled: false,
        bolloDigitale: false,
        fiscalCode: fiscalCode as FiscalCode,
        origin: "IO",
        iban: paymentRequest.ibanAccredito
      }
    };
    res.json(payment);
  }
);

/**
 * user pays
 * STEP 5
 */
addHandler(
  walletRouter,
  "post",
  appendWalletPrefix("/payments/:idPagamento/actions/pay"),
  (_, res) => {
    if (idPagamento === undefined || paymentRequest === undefined) {
      res.sendStatus(404);
      return;
    }

    res.json({ data: getTransactions(1)[0] });
  }
);
