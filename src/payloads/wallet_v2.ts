import { format } from "date-fns";
import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import sha256 from "sha256";
import { Abi } from "../../generated/definitions/pagopa/walletv2/Abi";
import { BPay } from "../../generated/definitions/pagopa/walletv2/BPay";
import { BPayInfo } from "../../generated/definitions/pagopa/walletv2/BPayInfo";
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
  TypeEnum as WalletV1TypeEnum,
  Wallet
} from "../../generated/definitions/pagopa/walletv2/Wallet";
import {
  WalletTypeEnum,
  WalletV2
} from "../../generated/definitions/pagopa/walletv2/WalletV2";
import { assetsFolder, shouldShuffle } from "../global";
import { currentProfile } from "../routers/profile";
import { readFileAsJSON } from "../utils/file";
import { creditCardBrands, getCreditCardLogo } from "../utils/payment";

type CardConfig = {
  prefix: string;
  index: number;
};

// tslint:disable-next-line: no-let
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
  return range(1, count).map(_ => {
    const config = fromNullable(
      cardConfigMap.get(WalletTypeEnum.Satispay)
    ).getOrElse(defaultCardConfig);
    const uuid = sha256(
      config.prefix + config.index.toString().padStart(4, "0")
    );
    cardConfigMap.set(WalletTypeEnum.Satispay, {
      ...config,
      index: config.index + 1
    });
    return {
      uuid
    };
  });
};

export const satispay = {
  hasMore: false,
  token: sha256("token"),
  uidSatispay: "uidSatispay",
  uidSatispayHash: sha256("uidSatispay")
};

export const generateBancomatPay = (
  abis: ReadonlyArray<Abi>,
  count: number
): ReadonlyArray<BPay> => {
  const shuffledAbis = faker.helpers.shuffle([...abis]);
  return range(1, count).map((_, idx) => {
    const config = fromNullable(
      cardConfigMap.get(WalletTypeEnum.BPay)
    ).getOrElse(defaultCardConfig);
    const suffix = config.index.toString().padStart(4, "0");
    const cn = config.prefix + suffix;
    const uidHash = sha256(cn);
    cardConfigMap.set(WalletTypeEnum.BPay, {
      ...config,
      index: config.index + 1
    });
    return {
      bankName: faker.company.companyName(),
      instituteCode: shuffledAbis[idx % shuffledAbis.length].abi,
      numberObfuscated: "+3934" + "*".repeat(7) + suffix,
      paymentInstruments: [],
      serviceState: "ATT",
      uidHash
    };
  });
};

export const isCobadge = (wallet: WalletV2, card: CardInfo) =>
  wallet.walletType === WalletTypeEnum.Card &&
  wallet.pagoPA === false &&
  card.issuerAbiCode !== undefined;

export const generateCards = (
  abis: ReadonlyArray<Abi>,
  count: number = 10,
  cardType: WalletTypeEnum.Card | WalletTypeEnum.Bancomat
): ReadonlyArray<CardInfo> => {
  const listAbi = shouldShuffle ? faker.helpers.shuffle([...abis]) : abis;
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
      abi: listAbi[idx % listAbi.length].abi,
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

const abiList = readFileAsJSON(assetsFolder + "/data/abi.json").data;
const abiCodes = (abiList ?? []).map((a: any) => a.abi);
// tslint:disable-next-line: no-let
let millis = new Date().getTime();
export const abiData = range(1, abiCodes.length - 1).map<Abi>(_ => {
  faker.seed(millis++);
  return {
    abi: abiCodes[
      faker.random.number({ min: 0, max: abiCodes.length - 1 })
    ].replace(".png", ""),
    name: faker.company.companyName()
  };
});

export const generateWalletV2FromCard = (
  card: Card,
  walletType: WalletTypeEnum,
  canMethodPay: boolean,
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
    expireMonth: (ed.getMonth() + 1).toString().padStart(2, "0"),
    expireYear: ed.getFullYear().toString(),
    hashPan: card.hpan,
    holder: `${currentProfile.name} ${currentProfile.family_name}`,
    htokenList: card.tokens,
    issuerAbiCode: canMethodPay ? undefined : card.abi,
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
    onboardingChannel: "IO",
    pagoPA: canMethodPay,
    updateDate: (format(new Date(), "yyyy-MM-dd") as any) as Date
  };
};

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
    onboardingChannel: "IO",
    pagoPA: false,
    updateDate: (format(new Date(), "yyyy-MM-dd") as any) as Date
  };
};

export const generateWalletV1FromCardInfo = (
  idWallet: number,
  info: CardInfo
): Wallet => ({
  idWallet,
  type: WalletV1TypeEnum.CREDIT_CARD,
  favourite: false,
  creditCard: {
    id: idWallet,
    holder: info.holder,
    pan: "*".repeat(12) + (info.blurredNumber ?? ""),
    expireMonth: info.expireMonth!.padStart(2, "0"),
    expireYear: info.expireYear!.slice(-2),
    brandLogo:
      "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/generic.png",
    flag3dsVerified: false,
    brand: info.brand,
    onUs: false
  },
  pspEditable: true,
  isPspToIgnore: false,
  saved: false,
  registeredNexi: false
});
