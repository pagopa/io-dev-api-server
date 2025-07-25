import * as t from "io-ts";
import {
  FaultCodeCategoryEnum as GatewayEnum,
  GatewayFaultPaymentProblemJson
} from "../../../../generated/definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import {
  FaultCodeCategoryEnum as PartyEnum,
  PartyConfigurationFaultPaymentProblemJson
} from "../../../../generated/definitions/pagopa/ecommerce/PartyConfigurationFaultPaymentProblemJson";
import {
  FaultCodeCategoryEnum as CancelledEnum,
  PaymentCanceledStatusFaultPaymentProblemJson
} from "../../../../generated/definitions/pagopa/ecommerce/PaymentCanceledStatusFaultPaymentProblemJson";
import {
  FaultCodeCategoryEnum as DuplicatedEnum,
  PaymentDuplicatedStatusFaultPaymentProblemJson
} from "../../../../generated/definitions/pagopa/ecommerce/PaymentDuplicatedStatusFaultPaymentProblemJson";
import {
  FaultCodeCategoryEnum as ExpiredEnum,
  PaymentExpiredStatusFaultPaymentProblemJson
} from "../../../../generated/definitions/pagopa/ecommerce/PaymentExpiredStatusFaultPaymentProblemJson";
import {
  FaultCodeCategoryEnum as OngoingEnum,
  PaymentOngoingStatusFaultPaymentProblemJson
} from "../../../../generated/definitions/pagopa/ecommerce/PaymentOngoingStatusFaultPaymentProblemJson";
import { ValidationFaultPaymentDataErrorProblemJson } from "../../../../generated/definitions/pagopa/ecommerce/ValidationFaultPaymentDataErrorProblemJson";
import {
  FaultCodeCategoryEnum as ValidationEnum,
  ValidationFaultPaymentUnavailableProblemJson
} from "../../../../generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnavailableProblemJson";
import {
  FaultCodeCategoryEnum as UnknownEnum,
  ValidationFaultPaymentUnknownProblemJson
} from "../../../../generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnknownProblemJson";
import { Detail_v2Enum } from "../../../../generated/definitions/backend/PaymentProblemJson";
import { PaymentDuplicatedStatusFaultEnum } from "../../../../generated/definitions/pagopa/ecommerce/PaymentDuplicatedStatusFault";
import { PaymentCanceledStatusFaultEnum } from "../../../../generated/definitions/pagopa/ecommerce/PaymentCanceledStatusFault";
import { PaymentExpiredStatusFaultEnum } from "../../../../generated/definitions/pagopa/ecommerce/PaymentExpiredStatusFault";
import { PaymentOngoingStatusFaultEnum } from "../../../../generated/definitions/pagopa/ecommerce/PaymentOngoingStatusFault";
import { ValidationFaultPaymentUnknownEnum } from "../../../../generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnknown";
import { PartyConfigurationFaultEnum } from "../../../../generated/definitions/pagopa/ecommerce/PartyConfigurationFault";
import { ValidationFaultPaymentUnavailableEnum } from "../../../../generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnavailable";

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
  if (
    ValidationFaultPaymentUnknownProblemJson.is(failure) ||
    ValidationFaultPaymentDataErrorProblemJson.is(failure)
  ) {
    return 404;
  } else if (
    PaymentDuplicatedStatusFaultPaymentProblemJson.is(failure) ||
    PaymentOngoingStatusFaultPaymentProblemJson.is(failure) ||
    PaymentExpiredStatusFaultPaymentProblemJson.is(failure) ||
    PaymentCanceledStatusFaultPaymentProblemJson.is(failure)
  ) {
    return 409;
  } else if (
    GatewayFaultPaymentProblemJson.is(failure) ||
    ValidationFaultPaymentUnavailableProblemJson.is(failure)
  ) {
    return 502;
  } else if (PartyConfigurationFaultPaymentProblemJson.is(failure)) {
    return 503;
  } else {
    return 400;
  }
};

export const httpStatusCodeFromDetailV2Enum = (input: Detail_v2Enum) => {
  switch (input) {
    case Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO:
    case Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO:
    case Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO:
    case Detail_v2Enum.PAA_PAGAMENTO_SCADUTO:
    case Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO:
    case Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO:
      return 409;
    case Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO:
      return 404;
    case Detail_v2Enum.PPT_ERRORE_EMESSO_DA_PAA:
      return 503;
    case Detail_v2Enum.PPT_AUTENTICAZIONE:
      return 502;
    default:
      return 400;
  }
};

export const payloadFromDetailV2Enum = (input: Detail_v2Enum) => {
  switch (input) {
    case Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO:
    case Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO:
      return {
        faultCodeCategory: DuplicatedEnum.PAYMENT_DUPLICATED,
        faultCodeDetail:
          PaymentDuplicatedStatusFaultEnum.PAA_PAGAMENTO_DUPLICATO
      };
    case Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO:
      return {
        faultCodeCategory: CancelledEnum.PAYMENT_CANCELED,
        faultCodeDetail: PaymentCanceledStatusFaultEnum.PAA_PAGAMENTO_ANNULLATO
      };
    case Detail_v2Enum.PAA_PAGAMENTO_SCADUTO:
      return {
        faultCodeCategory: ExpiredEnum.PAYMENT_EXPIRED,
        faultCodeDetail: PaymentExpiredStatusFaultEnum.PAA_PAGAMENTO_SCADUTO
      };
    case Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO:
    case Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO:
      return {
        faultCodeCategory: OngoingEnum.PAYMENT_ONGOING,
        faultCodeDetail: PaymentOngoingStatusFaultEnum.PAA_PAGAMENTO_IN_CORSO
      };
    case Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO:
      return {
        faultCodeCategory: UnknownEnum.PAYMENT_UNKNOWN,
        faultCodeDetail:
          ValidationFaultPaymentUnknownEnum.PAA_PAGAMENTO_SCONOSCIUTO
      };
    case Detail_v2Enum.PPT_ERRORE_EMESSO_DA_PAA:
      return {
        faultCodeCategory: PartyEnum.DOMAIN_UNKNOWN,
        faultCodeDetail: PartyConfigurationFaultEnum.PPT_ERRORE_EMESSO_DA_PAA
      };
    case Detail_v2Enum.PPT_AUTENTICAZIONE:
      return {
        faultCodeCategory: ValidationEnum.PAYMENT_UNAVAILABLE,
        faultCodeDetail:
          ValidationFaultPaymentUnavailableEnum.PPT_AUTENTICAZIONE
      };
    default:
      return {
        detail: "GENERIC ERROR",
        instance: GatewayEnum.GENERIC_ERROR,
        status: 400,
        title: "GENERIC ERROR",
        type: GatewayEnum.GENERIC_ERROR
      };
  }
};
