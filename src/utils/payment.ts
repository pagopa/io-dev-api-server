export const enum CreditCardBrandEnum {
  "VISAELECTRON" = "VISAELECTRON",
  "MAESTRO" = "MAESTRO",
  "UNIONPAY" = "UNIONPAY",
  "VISA" = "VISA",
  "MASTERCARD" = "MASTERCARD",
  "AMEX" = "AMEX",
  "DINERS" = "DINERS",
  "DISCOVER" = "DISCOVER",
  "JCB" = "JCB",
  "POSTEPAY" = "POSTEPAY"
}

export const creditCardBrands: ReadonlyArray<CreditCardBrandEnum> = [
  CreditCardBrandEnum.VISAELECTRON,
  CreditCardBrandEnum.MAESTRO,
  CreditCardBrandEnum.UNIONPAY,
  CreditCardBrandEnum.VISA,
  CreditCardBrandEnum.MASTERCARD,
  CreditCardBrandEnum.AMEX,
  CreditCardBrandEnum.DINERS,
  CreditCardBrandEnum.DISCOVER,
  //CreditCardBrandEnum.JCB,
  CreditCardBrandEnum.POSTEPAY
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
  [CreditCardBrandEnum.DINERS, "diners"]
]);
export const getCreditCardLogo = (cc: CreditCardBrandEnum) =>
  creditCardLogoMap.has(cc)
    ? `https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_${creditCardLogoMap.get(
        cc
      )}.png`
    : undefined;
