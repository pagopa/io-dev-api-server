import { pipe } from "fp-ts/lib/function";
import { PaymentDataWithRequiredPayee } from "../../generated/definitions/backend/PaymentDataWithRequiredPayee";
import { PaymentProblemJson } from "../../generated/definitions/backend/PaymentProblemJson";
import { RptId } from "../../generated/definitions/backend/RptId";
import { NotificationPaymentInfo } from "../features/pn/types/notificationPaymentInfo";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { PaymentData } from "../../generated/definitions/backend/PaymentData";

export const enum CreditCardBrandEnum {
  "VISAELECTRON" = "VISAELECTRON",
  "MAESTRO" = "MAESTRO",
  // "UNIONPAY" = "UNIONPAY",
  "VISA" = "VISA",
  "MASTERCARD" = "MASTERCARD",
  "AMEX" = "AMEX",
  "DINERS" = "DINERS",
  // "DISCOVER" = "DISCOVER",
  // "JCB" = "JCB",
  "POSTEPAY" = "POSTEPAY",
  "VPAY" = "VPAY"
}

export const creditCardBrands: ReadonlyArray<CreditCardBrandEnum> = [
  CreditCardBrandEnum.VISAELECTRON,
  CreditCardBrandEnum.MAESTRO,
  // CreditCardBrandEnum.UNIONPAY,
  CreditCardBrandEnum.VISA,
  CreditCardBrandEnum.MASTERCARD,
  CreditCardBrandEnum.AMEX,
  CreditCardBrandEnum.DINERS,
  // CreditCardBrandEnum.DISCOVER,
  CreditCardBrandEnum.POSTEPAY,
  CreditCardBrandEnum.VPAY
];

const creditCardLogoMap: Map<CreditCardBrandEnum, string> = new Map<
  CreditCardBrandEnum,
  string
>([
  [CreditCardBrandEnum.MASTERCARD, "mc"],
  [CreditCardBrandEnum.VISA, "visa"],
  [CreditCardBrandEnum.VISAELECTRON, "visaelectron"],
  [CreditCardBrandEnum.AMEX, "amex"],
  [CreditCardBrandEnum.MAESTRO, "maestro"],
  [CreditCardBrandEnum.POSTEPAY, "poste"],
  [CreditCardBrandEnum.VPAY, "vpay"],
  [CreditCardBrandEnum.DINERS, "diners"]
]);
export const getCreditCardLogo = (cc: CreditCardBrandEnum) =>
  creditCardLogoMap.has(cc)
    ? `https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_${creditCardLogoMap.get(
        cc
      )}.png`
    : undefined;

// undefined -> 0 -> success
export const isOutcomeCodeSuccessfully = (
  outcome: number | undefined
): boolean => (outcome ?? 0) === 0;

export const rptIdFromPaymentDataWithRequiredPayee = (
  paymentDataWithRequiredPayee: PaymentDataWithRequiredPayee
): RptId =>
  `${paymentDataWithRequiredPayee.payee.fiscal_code}${paymentDataWithRequiredPayee.notice_number}`;

export const rptIdFromNotificationPaymentInfo = (
  notificationPaymentInfo: NotificationPaymentInfo
): RptId =>
  `${notificationPaymentInfo.creditorTaxId}${notificationPaymentInfo.noticeCode}`;

export const rptIdFromServiceAndPaymentData = (
  service: ServicePublic,
  paymentData: PaymentData
) => `${service.organization_fiscal_code}${paymentData.notice_number}`;

export const isPaid = (paymentProblemJSON: PaymentProblemJson) =>
  pipe(
    paymentProblemJSON.detail_v2,
    detail =>
      detail === "PAA_PAGAMENTO_DUPLICATO" ||
      detail === "PPT_PAGAMENTO_DUPLICATO"
  );
