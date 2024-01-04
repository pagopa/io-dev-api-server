import * as t from "io-ts";
import { GatewayFault } from "../../../../generated/definitions/pagopa/ecommerce/GatewayFault";
import { PartyConfigurationFault } from "../../../../generated/definitions/pagopa/ecommerce/PartyConfigurationFault";
import { PartyTimeoutFault } from "../../../../generated/definitions/pagopa/ecommerce/PartyTimeoutFault";
import { PaymentStatusFault } from "../../../../generated/definitions/pagopa/ecommerce/PaymentStatusFault";
import { ValidationFault } from "../../../../generated/definitions/pagopa/ecommerce/ValidationFault";

export type WalletPaymentFailure = t.TypeOf<typeof WalletPaymentFailure>;
export const WalletPaymentFailure = t.union([
  ValidationFault,
  PaymentStatusFault,
  GatewayFault,
  PartyConfigurationFault,
  PartyTimeoutFault
]);

export const getStatusCodeForWalletFailure = (
  failure:
    | ValidationFault
    | PaymentStatusFault
    | GatewayFault
    | PartyConfigurationFault
    | PartyTimeoutFault
): 404 | 409 | 502 | 503 | 504 => {
  if (ValidationFault.is(failure)) {
    return 404;
  } else if (PaymentStatusFault.is(failure)) {
    return 409;
  } else if (GatewayFault.is(failure)) {
    return 502;
  } else if (PartyConfigurationFault.is(failure)) {
    return 503;
  } else {
    return 504;
  }
};
