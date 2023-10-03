import { pipe } from "fp-ts/lib/function";
import { PaymentDataWithRequiredPayee } from "../../generated/definitions/backend/PaymentDataWithRequiredPayee";
import {
  CategoryEnum,
  DetailEnum,
  Detail_v2Enum,
  PaymentProblemJson
} from "../../generated/definitions/backend/PaymentProblemJson";
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

export const detailV2EnumToPaymentProblemJSON = (
  details: Detail_v2Enum
): PaymentProblemJson => ({
  detail: DetailEnum.PAYMENT_UNKNOWN, // Legacy, it is the default value provided
  detail_v2: details,
  category: detailV2EnumToCategoryEnum(details)
});

// eslint-disable-next-line complexity
const detailV2EnumToCategoryEnum = (details: Detail_v2Enum): CategoryEnum => {
  switch (details) {
    case Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO:
      return CategoryEnum.PAYMENT_CANCELED;

    case Detail_v2Enum.PAA_PAGAMENTO_SCADUTO:
    case Detail_v2Enum.PPT_TOKEN_SCADUTO:
      return CategoryEnum.PAYMENT_EXPIRED;

    case Detail_v2Enum.PPT_ID_CARRELLO_DUPLICATO:
    case Detail_v2Enum.PPT_RT_DUPLICATA:
    case Detail_v2Enum.PPT_RPT_DUPLICATA:
    case Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO:
    case Detail_v2Enum.CANALE_RPT_DUPLICATA:
    case Detail_v2Enum.CANALE_CARRELLO_DUPLICATO_KO:
    case Detail_v2Enum.CANALE_CARRELLO_DUPLICATO_UNKNOWN:
    case Detail_v2Enum.CANALE_CARRELLO_DUPLICATO_OK:
    case Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO:
      return CategoryEnum.PAYMENT_DUPLICATED;

    case Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO:
    case Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO:
      return CategoryEnum.PAYMENT_ONGOING;

    case Detail_v2Enum.PPT_RT_NONDISPONIBILE:
    case Detail_v2Enum.PPT_FIRMA_INDISPONIBILE:
    case Detail_v2Enum.PPT_CANALE_INDISPONIBILE:
    case Detail_v2Enum.PPT_STAZIONE_INT_PA_INDISPONIBILE:
    case Detail_v2Enum.PAA_FIRMA_INDISPONIBILE:
    case Detail_v2Enum.CANALE_RT_NON_DISPONIBILE:
    case Detail_v2Enum.CANALE_INDISPONIBILE:
      return CategoryEnum.PAYMENT_UNAVAILABLE;

    case Detail_v2Enum.PPT_RPT_SCONOSCIUTA:
    case Detail_v2Enum.PPT_RT_SCONOSCIUTA:
    case Detail_v2Enum.PPT_TIPOFIRMA_SCONOSCIUTO:
    case Detail_v2Enum.PPT_WISP_SESSIONE_SCONOSCIUTA:
    case Detail_v2Enum.PPT_CODIFICA_PSP_SCONOSCIUTA:
    case Detail_v2Enum.PPT_PSP_SCONOSCIUTO:
    case Detail_v2Enum.PPT_TIPO_VERSAMENTO_SCONOSCIUTO:
    case Detail_v2Enum.PPT_INTERMEDIARIO_PSP_SCONOSCIUTO:
    case Detail_v2Enum.PPT_CANALE_SCONOSCIUTO:
    case Detail_v2Enum.PPT_INTERMEDIARIO_PA_SCONOSCIUTO:
    case Detail_v2Enum.PPT_STAZIONE_INT_PA_SCONOSCIUTA:
    case Detail_v2Enum.PPT_ID_FLUSSO_SCONOSCIUTO:
    case Detail_v2Enum.PAA_RPT_SCONOSCIUTA:
    case Detail_v2Enum.PAA_TIPOFIRMA_SCONOSCIUTO:
    case Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO:
    case Detail_v2Enum.CANALE_RPT_SCONOSCIUTA:
    case Detail_v2Enum.CANALE_RT_SCONOSCIUTA:
    case Detail_v2Enum.CANALE_FIRMA_SCONOSCIUTA:
    case Detail_v2Enum.PPT_TOKEN_SCONOSCIUTO:
    case Detail_v2Enum.PPT_POSIZIONE_SCONOSCIUTA:
      return CategoryEnum.PAYMENT_UNKNOWN;

    case Detail_v2Enum.PPT_DOMINIO_SCONOSCIUTO:
      return CategoryEnum.DOMAIN_UNKNOWN;
  }
  return CategoryEnum.GENERIC_ERROR;
};
