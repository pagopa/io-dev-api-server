import * as t from "io-ts";
import { GatewayFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { PartyConfigurationFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/PartyConfigurationFaultPaymentProblemJson";
import { PaymentCanceledStatusFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/PaymentCanceledStatusFaultPaymentProblemJson";
import { PaymentDuplicatedStatusFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/PaymentDuplicatedStatusFaultPaymentProblemJson";
import { PaymentExpiredStatusFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/PaymentExpiredStatusFaultPaymentProblemJson";
import { PaymentOngoingStatusFaultPaymentProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/PaymentOngoingStatusFaultPaymentProblemJson";
import { ValidationFaultPaymentDataErrorProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/ValidationFaultPaymentDataErrorProblemJson";
import { ValidationFaultPaymentUnavailableProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnavailableProblemJson";
import { ValidationFaultPaymentUnknownProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnknownProblemJson";

export type WalletPaymentFailure = t.TypeOf<typeof WalletPaymentFailure>;
export const WalletPaymentFailure = t.union([
  GatewayFaultPaymentProblemJson,
  PartyConfigurationFaultPaymentProblemJson,
  ValidationFaultPaymentUnknownProblemJson,
  ValidationFaultPaymentDataErrorProblemJson,
  PaymentExpiredStatusFaultPaymentProblemJson,
  PaymentOngoingStatusFaultPaymentProblemJson,
  PaymentCanceledStatusFaultPaymentProblemJson,
  ValidationFaultPaymentUnavailableProblemJson,
  PaymentDuplicatedStatusFaultPaymentProblemJson
]);

export const getStatusCodeForWalletFailure = (
  failure: WalletPaymentFailure
): 400 | 404 | 409 | 502 | 503 => {
  if (ValidationFaultPaymentUnknownProblemJson.is(failure)) {
    return 404;
  } else if (PaymentDuplicatedStatusFaultPaymentProblemJson.is(failure)) {
    return 409;
  } else if (GatewayFaultPaymentProblemJson.is(failure)) {
    return 502;
  } else if (PartyConfigurationFaultPaymentProblemJson.is(failure)) {
    return 503;
  } else {
    return 400;
  }
};
