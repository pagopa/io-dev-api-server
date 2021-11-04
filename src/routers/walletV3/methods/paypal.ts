import { Router } from "express";
import { PaypalPspListResponse } from "../../../../generated/definitions/pagopa/PaypalPspListResponse";
import { assetsFolder } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { readFileAsJSON } from "../../../utils/file";
import { validatePayload } from "../../../utils/validator";
import { appendWalletV3Prefix } from "../../../utils/wallet";

export const payPalRouter = Router();
/**
 * return the list of the paypal psp
 */
addHandler(
  payPalRouter,
  "get",
  appendWalletV3Prefix("/paypal/searchPSP"),
  (_, res) => {
    const maybePspResponse = validatePayload(
      PaypalPspListResponse,
      readFileAsJSON(assetsFolder + "/pm/paypal/psp.json")
    );
    res.json(maybePspResponse);
  }
);
