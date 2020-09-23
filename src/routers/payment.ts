import { Router } from "express";
import { getPaymentRequestsGetResponse } from "../payloads/payload";
import { installHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import { profileRouter } from "./profile";

export const paymentRouter = Router();

// verifica
installHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/payment-requests/:rptId"),
  () => ({
    payload: getPaymentRequestsGetResponse()
  })
);
