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
