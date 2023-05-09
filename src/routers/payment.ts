import { Request, Response, Router } from "express";
import { faker } from "@faker-js/faker/locale/it";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Iban } from "../../generated/definitions/backend/Iban";
import { PaymentActivationsGetResponse } from "../../generated/definitions/backend/PaymentActivationsGetResponse";
import { PaymentActivationsPostRequest } from "../../generated/definitions/backend/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../../generated/definitions/backend/PaymentActivationsPostResponse";
import {
  DetailEnum,
  Detail_v2Enum
} from "../../generated/definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../generated/definitions/backend/PaymentRequestsGetResponse";
import { PaymentResponse } from "../../generated/definitions/pagopa/walletv2/PaymentResponse";
import { ioDevServerConfig } from "../config";
import { getPaymentRequestsGetResponse } from "../payloads/payload";
import { addHandler, addNewRoute } from "../payloads/response";
import { serverUrl } from "../utils/server";
import { addApiV1Prefix } from "../utils/strings";
import { appendWalletV1Prefix } from "../utils/wallet";
import { profileRouter } from "./profile";
import { walletRouter } from "./wallet";
import ServicesDB, { ServiceSummary } from "./../persistence/services";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";

export const paymentRouter = Router();

const responseWithError = (detailV2: Detail_v2Enum, res: Response) =>
  res.status(500).json({
    // deprecated, it is just a placeholder
    detail: DetailEnum.PAYMENT_UNKNOWN,
    detail_v2: detailV2
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
  // success response: res.json(getPaymentRequestsGetResponse(faker.helpers.arrayElement(services))))
  // error response: responseWithError(DetailEnum.PAYMENT_DUPLICATED, res)
  (_, res) => {
    return pipe(
      ServicesDB.getSummaries(),
      faker.helpers.arrayElement,
      (randomServiceSummary: ServiceSummary) => randomServiceSummary.service_id,
      ServicesDB.getService,
      O.fromNullable,
      O.fold(
        () =>
          res
            .sendStatus(500)
            .json({ error: "Unable to find auto-referenced service" }),
        (randomService: ServicePublic) =>
          pipe(
            ioDevServerConfig.wallet.verificaError,
            O.fromNullable,
            O.fold(
              () =>
                pipe(getPaymentRequestsGetResponse(randomService), res.json),
              (errorCode: Detail_v2Enum) => responseWithError(errorCode, res)
            )
          )
      )
    );
  }
);

/**
 * the user wants to lock this payment (ATTIVA)
 * this API return the
 * STEP 2
 */
addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/payment-activations"),
  (req, res) => {
    if (paymentRequest === undefined) {
      res.sendStatus(404);
      return;
    }
    const pr: PaymentRequestsGetResponse = paymentRequest;
    pipe(
      O.fromNullable(ioDevServerConfig.wallet.attivaError),
      O.fold(
        () => {
          pipe(
            PaymentActivationsPostRequest.decode(req.body),
            E.fold(
              () => {
                res.sendStatus(403);
              },
              _ => {
                const response: PaymentActivationsPostResponse = {
                  importoSingoloVersamento: pr.importoSingoloVersamento,
                  causaleVersamento: pr.causaleVersamento,
                  ibanAccredito: faker.finance.iban() as Iban,
                  enteBeneficiario: pr.enteBeneficiario
                };
                res.json(response);
              }
            )
          );
        },
        error => responseWithError(error, res)
      )
    );
  }
);

/**
 * the app stats a polling using codiceContestoPagamento as input
 * when the payment is finally locked this API returns the idPagamento
 * STEP 3
 */
addHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/payment-activations/:codiceContestopagamento"),
  (_, res) => {
    idPagamento = faker.random.alphaNumeric(30);
    const response: PaymentActivationsGetResponse = {
      idPagamento
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
  appendWalletV1Prefix("/payments/:idPagamento/actions/check"),
  (_, res) => {
    if (idPagamento === undefined || paymentRequest === undefined) {
      res.sendStatus(404);
      return;
    }
    const payment: PaymentResponse = {
      data: {
        id: faker.datatype.number(),
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
        fiscalCode: ioDevServerConfig.profile.attrs.fiscal_code,
        origin: "IO",
        iban: paymentRequest.ibanAccredito
      }
    };
    res.json(payment);
  }
);

export const handlePaymentPostAndRedirect = (
  req: Request,
  res: Response,
  outcomeValue: number = 0,
  title: string = "Pay web page"
) => {
  const formData = Object.keys(req.body)
    .map(k => `<b>${k}</b>: ${req.body[k]}`)
    .join("<br/>");
  // set a timeout to redirect to the exit url
  const exitPathName = "/wallet/v3/webview/logout/bye";
  const outcomeParamname = "outcome";
  const secondsToRedirect = 2;
  const redirectUrl = `"${serverUrl}${exitPathName}?${outcomeParamname}=${outcomeValue}"`;
  const exitRedirect = `<script type="application/javascript">setTimeout(() => {window.location.replace(${redirectUrl});},${secondsToRedirect *
    1000});</script>`;
  res.send(
    `<h1>${title}</h1><h1>wait ${secondsToRedirect} seconds to redirect to the exit point</h1><h3>received data</h3>${formData}<br/>${exitRedirect}`
  );
};

// credit card - onboarding payment
addHandler(
  walletRouter,
  "post",
  "/wallet/v3/webview/transactions/cc/verify",
  (req, res) =>
    handlePaymentPostAndRedirect(
      req,
      res,
      ioDevServerConfig.wallet.onboardingCreditCardOutCode,
      "Credit Card onboarding"
    )
);

// payment
addHandler(
  walletRouter,
  "post",
  "/wallet/v3/webview/transactions/pay",
  (req, res) =>
    handlePaymentPostAndRedirect(
      req,
      res,
      ioDevServerConfig.wallet.paymentOutCode
    )
);

/**
 * delete payment
 * user wants to stop the current payment
 */
addHandler(
  walletRouter,
  "delete",
  appendWalletV1Prefix("/payments/:idPagamento/actions/delete"),
  (req, res) => {
    if (idPagamento !== req.params.idPagamento) {
      res.sendStatus(404);
      return;
    }
    idPagamento = undefined;
    res.sendStatus(200);
  }
);

// only for stats displaying purposes
addNewRoute("post", "/wallet/v3/webview/transactions/pay");
