import faker from "faker/locale/it";
import { range } from "fp-ts/lib/Array";
import sha256 from "sha256";
import { Abi } from "../../generated/definitions/pagopa/bancomat/Abi";
import {
  Card,
  ProductTypeEnum,
  ValidityStateEnum
} from "../../generated/definitions/pagopa/bancomat/Card";

export const generateCards = (abis: ReadonlyArray<Abi>, count: number = 10) => {
  // tslint:disable-next-line
  const shuffledAbis = faker.helpers.shuffle(abis as Abi[]);
  return range(1, Math.min(count, abis.length)).map<Card>((_, idx) => {
    const cn = faker.finance.creditCardNumber();
    const ed = faker.date.future();
    return {
      abi: shuffledAbis[idx].abi,
      cardNumber: cn,
      cardPartialNumber: cn.substr(cn.lastIndexOf("-") + 1).substr(0, 4),
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
