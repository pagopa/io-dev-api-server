import * as t from "io-ts";
import { GatewayFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { PartyConfigurationFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/PartyConfigurationFaultPaymentProblemJson";
import { PartyTimeoutFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/PartyTimeoutFaultPaymentProblemJson";
import { PaymentStatusFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/PaymentStatusFaultPaymentProblemJson";
import { ValidationFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/ValidationFaultPaymentProblemJson";

export type WalletPaymentFailure = t.TypeOf<typeof WalletPaymentFailure>;
export const WalletPaymentFailure = t.union([
  ValidationFaultPaymentProblemJson,
  PaymentStatusFaultPaymentProblemJson,
  GatewayFaultPaymentProblemJson,
  PartyConfigurationFaultPaymentProblemJson,
  PartyTimeoutFaultPaymentProblemJson
]);

export const getStatusCodeForWalletFailure = (
  failure: WalletPaymentFailure
): 404 | 409 | 502 | 503 | 504 => {
  if (ValidationFaultPaymentProblemJson.is(failure)) {
    return 404;
  } else if (PaymentStatusFaultPaymentProblemJson.is(failure)) {
    return 409;
  } else if (GatewayFaultPaymentProblemJson.is(failure)) {
    return 502;
  } else if (PartyConfigurationFaultPaymentProblemJson.is(failure)) {
    return 503;
  } else {
    return 504;
  }
};
