import { Router } from "express";
import { EnableableFunctionsEnum } from "../../../../generated/definitions/pagopa/EnableableFunctions";
import { PaypalPspListResponse } from "../../../../generated/definitions/pagopa/PaypalPspListResponse";
import { WalletTypeEnum } from "../../../../generated/definitions/pagopa/WalletV2";
import { assetsFolder, ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import {
  generatePaypalInfo,
  generateWalletV2FromPaypal
} from "../../../payloads/wallet_v2";
import { readFileAsJSON } from "../../../utils/file";
import { validatePayload } from "../../../utils/validator";
import { appendWalletV3Prefix } from "../../../utils/wallet";
import { handlePaymentPostAndRedirect } from "../../payment";
import { walletRouter } from "../../wallet";
import { addWalletV2, getWalletV2 } from "../../walletsV2";

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

// paypal onboarding checkout
addHandler(
  walletRouter,
  "post",
  appendWalletV3Prefix("/webview/paypal/onboarding/psp"),
  (req, res) => {
    const isPaypalAlreadyPresent =
      getWalletV2().find(w => w.walletType === WalletTypeEnum.PayPal) !==
      undefined;
    const outcomeCode = ioDevServerConfig.wallet.onboardingPaypalOutCode ?? 0;
    // oucomeCode -> 0 -> success
    // only 1 paypal payment method can exists in the user wallet
    // add it to the wallet only if the outComeCode is success and it doesn't already exist in the wallet
    if (!isPaypalAlreadyPresent && outcomeCode === 0) {
      const newPaypal = generatePaypalInfo(1).map(c =>
        generateWalletV2FromPaypal(c, [EnableableFunctionsEnum.pagoPA])
      )[0];
      // set favourite off all other payment methods
      const otherPaymentMethods = getWalletV2().map(w => ({
        ...w,
        favourite: false
      }));
      // add paypal to the existing payment methods and set it as favourite (mimic PM logic)
      addWalletV2(
        [...otherPaymentMethods, { ...newPaypal, favourite: true }],
        false
      );
    }
    handlePaymentPostAndRedirect(req, res, outcomeCode, "PayPal checkout");
  }
);
