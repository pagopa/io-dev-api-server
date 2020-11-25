import { format } from "date-fns";
import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";
import sha256 from "sha256";
import { Abi } from "../../generated/definitions/pagopa/walletv2/Abi";
import { BPayInfo } from "../../generated/definitions/pagopa/walletv2/BPayInfo";
import { BPayPaymentInstrumentWallet } from "../../generated/definitions/pagopa/walletv2/BPayPaymentInstrumentWallet";
import {
  Card,
  ProductTypeEnum,
  ValidityStateEnum
} from "../../generated/definitions/pagopa/walletv2/Card";
import {
  CardInfo,
  TypeEnum
} from "../../generated/definitions/pagopa/walletv2/CardInfo";
import { SatispayInfo } from "../../generated/definitions/pagopa/walletv2/SatispayInfo";
import {
  WalletTypeEnum,
  WalletV2
} from "../../generated/definitions/pagopa/walletv2/WalletV2";
import { currentProfile } from "../routers/profile";
import { creditCardBrands, getCreditCardLogo } from "../utils/payment";
import { Satispay } from "../../generated/definitions/pagopa/Satispay";

type CardConfig = {
  prefix: string;
  index: number;
};

// tslint:disable-next-line
let defaultCardConfig: CardConfig = { prefix: "00000000000", index: 0 };
const cardConfigMap: Map<WalletTypeEnum, CardConfig> = new Map<
  WalletTypeEnum,
  CardConfig
>([
  [WalletTypeEnum.Card, { prefix: "000012345678", index: 0 }],
  [WalletTypeEnum.Bancomat, { prefix: "123400005678", index: 0 }],
  [WalletTypeEnum.BPay, { prefix: "123456780000", index: 0 }],
  [WalletTypeEnum.Satispay, { prefix: "125678000034", index: 0 }]
]);

export const resetCardConfig = () => {
  cardConfigMap.forEach((v, k) => cardConfigMap.set(k, { ...v, index: 0 }));
};

export const generateSatispayInfo = (
  count: number
): ReadonlyArray<SatispayInfo> => {
  const config = fromNullable(
    cardConfigMap.get(WalletTypeEnum.Satispay)
  ).getOrElse(defaultCardConfig);
  const uuid = sha256(config.prefix) + config.index.toString().padStart(4, "0");
  cardConfigMap.set(WalletTypeEnum.Satispay, {
    ...config,
    index: config.index + 1
  });
  return range(1, count).map(_ => ({
    brandLogo: faker.random.image(),
    uuid
  }));
};

export const satispay = {
  hasMore: false,
  token: sha256("token"),
  uidSatispay: "uidSatispay",
  uidSatispayHash: sha256("uidSatispay")
};

export const generateBancomatPay = (count: number): ReadonlyArray<BPayInfo> => {
  const config = fromNullable(
    cardConfigMap.get(WalletTypeEnum.Bancomat)
  ).getOrElse(defaultCardConfig);
  const uidHash =
    sha256(config.prefix) + config.index.toString().padStart(4, "0");
  cardConfigMap.set(WalletTypeEnum.Bancomat, {
    ...config,
    index: config.index + 1
  });
  return range(1, count).map(_ => ({
    bankName: faker.company.companyName(),
    instituteCode: config.index.toString(),
    numberObfuscated:
      "+3934" + "*".repeat(7) + config.index.toString().padStart(3, "0"),
    paymentInstruments: [],
    uidHash
  }));
};

export const generateCards = (
  abis: ReadonlyArray<Abi>,
  count: number = 10,
  cardType: WalletTypeEnum.Card | WalletTypeEnum.Bancomat
): ReadonlyArray<CardInfo> => {
  // tslint:disable-next-line
  const shuffledAbis = faker.helpers.shuffle(abis as Abi[]);
  return range(1, Math.min(count, abis.length)).map<CardInfo>((_, idx) => {
    const config = fromNullable(cardConfigMap.get(cardType)).getOrElse(
      defaultCardConfig
    );
    const cn = config.prefix + config.index.toString().padStart(4, "0");
    if (cardConfigMap.get(cardType)) {
      cardConfigMap.set(cardType, { ...config, index: config.index + 1 });
    } else {
      defaultCardConfig = { ...config, index: config.index + 1 };
    }
    const ed = faker.date.future();
    return {
      abi: shuffledAbis[idx].abi,
      cardNumber: cn,
      cardPartialNumber: cn.slice(-4),
      expiringDate: ed.toISOString(),
      hpan: sha256(cn),
      productType: ProductTypeEnum.PP,
      tokens: ["token1", "token2"],
      validityState: ValidityStateEnum.V
    };
  });
};

export const abiData = range(1, 500).map<Abi>(idx => ({
  abi: idx.toString().padStart(5, "0"),
  name: faker.company.companyName()
}));

/**
 * info could be CardInfo (Card or Bancomat)
 * @param card
 * @param enableableFunctions
 */
export const generateWalletV2FromCard = (
  card: Card,
  walletType: WalletTypeEnum,
  enableableFunctions: ReadonlyArray<string> = ["FA", "pagoPA", "BPD"]
): WalletV2 => {
  const ed = card.expiringDate
    ? new Date(card.expiringDate)
    : faker.date.future();
  const ccBrand = faker.random.arrayElement(creditCardBrands);

  const info = {
    blurredNumber: card.cardPartialNumber,
    brand: ccBrand,
    brandLogo: getCreditCardLogo(ccBrand),
    expireMonth: (ed.getMonth() + 1).toString(),
    expireYear: ed.getFullYear().toString(),
    hashPan: card.hpan,
    holder: `${currentProfile.name} ${currentProfile.family_name}`,
    htokenList: card.tokens,
    issuerAbiCode: card.abi,
    type: TypeEnum.PP
  };

  return {
    walletType,
    // force createDate to be a string because we need to force a specific date format
    createDate: (format(ed, "yyyy-MM-dd") as any) as Date,
    enableableFunctions,
    favourite: false,
    idWallet: faker.random.number({ min: 20000, max: 30000 }),
    info,
    onboardingChannel: "I",
    pagoPA: true,
    updateDate: (format(new Date(), "yyyy-MM-dd") as any) as Date
  };
};

/**
 * @param satispay
 * @param enableableFunctions
 */
export const generateWalletV2FromSatispayOrBancomatPay = (
  info: SatispayInfo | BPayInfo,
  walletType: WalletTypeEnum.Satispay | WalletTypeEnum.BPay,
  enableableFunctions: ReadonlyArray<string> = ["FA", "pagoPA", "BPD"]
): WalletV2 => {
  const ed = faker.date.future();
  return {
    walletType,
    // force createDate to be a string because we need to force a specific date format
    createDate: (format(ed, "yyyy-MM-dd") as any) as Date,
    enableableFunctions,
    favourite: false,
    idWallet: faker.random.number({ min: 20000, max: 30000 }),
    info,
    onboardingChannel: "I",
    pagoPA: true,
    updateDate: (format(new Date(), "yyyy-MM-dd") as any) as Date
  };
};
