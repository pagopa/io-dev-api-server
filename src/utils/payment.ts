import { PaymentDataBase } from "../../generated/definitions/communication/PaymentDataBase";
import { PaymentDataWithRequiredPayee } from "../../generated/definitions/communication/PaymentDataWithRequiredPayee";
import { PaymentFaultV2Enum } from "../../generated/definitions/communication/PaymentFaultV2";
import { ServiceDetails } from "../../generated/definitions/services/ServiceDetails";
import { NotificationPaymentInfo } from "../features/pn/types/notificationPaymentInfo";

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
): string =>
  `${paymentDataWithRequiredPayee.payee.fiscal_code}${paymentDataWithRequiredPayee.notice_number}`;

export const rptIdFromNotificationPaymentInfo = (
  notificationPaymentInfo: NotificationPaymentInfo
): string =>
  `${notificationPaymentInfo.creditorTaxId}${notificationPaymentInfo.noticeCode}`;

export const rptIdFromServiceAndPaymentData = (
  service: ServiceDetails,
  paymentData: PaymentDataBase
) => `${service.organization.fiscal_code}${paymentData.notice_number}`;

export const detailV2EnumToPaymentProblemJSON = (
  details: PaymentFaultV2Enum
): { detail_v2: PaymentFaultV2Enum } => ({
  detail_v2: details
});
