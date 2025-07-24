import { CodeEnum as IbanErrorCodeEnum } from "../../../../generated/definitions/idpay/IbanErrorDTO";
import { CodeEnum as InitiativeErrorCodeEnum } from "../../../../generated/definitions/idpay/InitiativeErrorDTO";
import { CodeEnum as OnboardingErrorCodeEnum } from "../../../../generated/definitions/idpay/OnboardingErrorDTO";
import { CodeEnum as PaymentInstrumentErrorCode } from "../../../../generated/definitions/idpay/PaymentInstrumentErrorDTO";
import { CodeEnum as TimelineErrorCodeEnum } from "../../../../generated/definitions/idpay/TimelineErrorDTO";
import { CodeEnum as TransactionErrorCodeEnum } from "../../../../generated/definitions/idpay/TransactionErrorDTO";
import { CodeEnum as WalletErrorCodeEnum } from "../../../../generated/definitions/idpay/WalletErrorDTO";

export type ErrorDto = {
  code: number | string;
  message?: string;
};

type ErrorCodes =
  | OnboardingErrorCodeEnum
  | TransactionErrorCodeEnum
  | PaymentInstrumentErrorCode
  | IbanErrorCodeEnum
  | InitiativeErrorCodeEnum
  | TimelineErrorCodeEnum
  | WalletErrorCodeEnum;

export const getIdPayError = (
  code: ErrorCodes,
  message: string = ""
): ErrorDto => ({
  code,
  message
});
