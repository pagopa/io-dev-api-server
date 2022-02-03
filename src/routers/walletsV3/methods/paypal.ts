import { EnableableFunctionsEnum } from "../../../../generated/definitions/pagopa/EnableableFunctions";
import { PaypalPspListResponse } from "../../../../generated/definitions/pagopa/PaypalPspListResponse";
import { WalletTypeEnum } from "../../../../generated/definitions/pagopa/WalletV2";
import { assetsFolder } from "../../../config";

import {
  generatePaypalInfo,
  generateWalletV2FromPaypal
} from "../../../payloads/wallet_v2";
import { readFileAsJSON } from "../../../utils/file";
import { validatePayload } from "../../../utils/validator";
import { appendWalletV3Prefix } from "../../../utils/wallet";
import { handlePaymentPostAndRedirect } from "../../payment";

import {
  addWalletV2,
  getWalletV2,
  WalletV2PluginOptions
} from "../../walletsV2";

import { Plugin } from "../../../core/server";

import * as t from "io-ts";

export const PayPalPluginOptions = t.intersection([
  WalletV2PluginOptions,
  t.interface({
    wallet: t.partial({
      onboardingPaypalOutCode: t.number
    })
  })
]);

export type PayPalPluginOptions = t.TypeOf<typeof PayPalPluginOptions>;

export const PayPalPlugin: Plugin<PayPalPluginOptions> = async (
  { handleRoute },
  options
) => {
  /**
   * return the list of the paypal psp
   */
  handleRoute("get", appendWalletV3Prefix("/paypal/psps"), (_, res) => {
    const maybePspResponse = validatePayload(
      PaypalPspListResponse,
      readFileAsJSON(assetsFolder + "/pm/paypal/psp.json")
    );
    res.json(maybePspResponse);
  });

  // paypal onboarding checkout
  handleRoute(
    "post",
    appendWalletV3Prefix("/webview/paypal/onboarding/psp"),
    (req, res) => {
      const isPaypalAlreadyPresent =
        getWalletV2().find(w => w.walletType === WalletTypeEnum.PayPal) !==
        undefined;
      // if the citizen has no paypal account return an error code see https://pagopa.atlassian.net/wiki/spaces/TKM/pages/419759812/Paga+con+Paypal+-+Design+Review#Outcome
      const outcomeCode = options.wallet.methods.citizenPaypal
        ? options.wallet.onboardingPaypalOutCode ?? 0
        : 1; // 1 -> generic error
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
};
