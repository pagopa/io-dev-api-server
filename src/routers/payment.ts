import { Router } from "express";
import {
  DetailEnum,
  PaymentProblemJson
} from "../../generated/definitions/backend/PaymentProblemJson";
import { getPaymentRequestsGetResponse } from "../payloads/payload";
import { installHandler, IOResponse } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import { profileRouter } from "./profile";

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
  () => getVerificaError(DetailEnum.PAYMENT_DUPLICATED)
);
