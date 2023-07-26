import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { faker } from "@faker-js/faker/locale/it";
import { SupportTypeEnum } from "../../../../generated/definitions/cgn/merchants/SupportType";

export const ALL_NATIONAL_ADDRESSES_TEXT =
  "Tutti i punti vendita sul territorio nazionale";

export const getSupportValueFromType = (supportType: SupportTypeEnum) => {
  switch (supportType) {
    case SupportTypeEnum.EMAILADDRESS:
      return faker.internet.email() as NonEmptyString;
    case SupportTypeEnum.PHONENUMBER:
      return faker.phone.number("+39 #########") as NonEmptyString;
    case SupportTypeEnum.WEBSITE:
      return faker.internet.url() as NonEmptyString;
  }
};
