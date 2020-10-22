import { format } from "date-fns";
import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import sha256 from "sha256";
import { Abi } from "../../generated/definitions/pagopa/bancomat/Abi";
import {
  Card,
  ProductTypeEnum,
  ValidityStateEnum
} from "../../generated/definitions/pagopa/bancomat/Card";
import {
  CardInfo,
  TypeEnum
} from "../../generated/definitions/pagopa/bancomat/CardInfo";
import {
  WalletTypeEnum,
  WalletV2
} from "../../generated/definitions/pagopa/bancomat/WalletV2";
import { currentProfile } from "../routers/profile";
import { creditCardBrands, getCreditCardLogo } from "../utils/payment";

export const generateCards = (abis: ReadonlyArray<Abi>, count: number = 10) => {
  // tslint:disable-next-line
  const shuffledAbis = faker.helpers.shuffle(abis as Abi[]);
  return range(1, Math.min(count, abis.length)).map<Card>((_, idx) => {
    const cn = faker.finance.creditCardNumber();
    const ed = faker.date.future();
    const lastIndex = cn.lastIndexOf("-");
    const partialNumberIndex = lastIndex >= 0 ? lastIndex + 1 : cn.length - 5;
    return {
      abi: shuffledAbis[idx].abi,
      cardNumber: cn,
      cardPartialNumber: cn.substr(partialNumberIndex).substr(0, 4),
      expiringDate: ed,
      hpan: sha256(cn),
      productType: ProductTypeEnum.PP,
      tokens: ["token1", "token2"],
      validityState: ValidityStateEnum.V
    };
  });
};

export const generateAbiData = (count: number, withImage: boolean = false) =>
  range(1, count).map<Abi>(idx => ({
    abi: idx.toString().padStart(5, "0"),
    name: faker.company.companyName(),
    logoUrl: withImage ? faker.image.imageUrl(64, 64) : undefined
  }));

/**
 * info could be CardInfo
 * @param card
 * @param enableableFunctions
 */
export const generateWalletV2 = (
  card: Card,
  enableableFunctions: ReadonlyArray<string> = ["FA", "pagoPA", "BPD"]
): WalletV2 => {
  const ed = card.expiringDate ?? faker.date.future();
  const ccBrand = faker.random.arrayElement(creditCardBrands);
  const info: CardInfo = {
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
    walletType: WalletTypeEnum.Bancomat,
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
