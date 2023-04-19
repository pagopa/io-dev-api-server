import { faker } from "@faker-js/faker/locale/it";
import { IbanDTO } from "../../../../../generated/definitions/idpay/IbanDTO";
import { ioDevServerConfig } from "../../../../config";

const createRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban(),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.name(),
  description: faker.company.bs(),
  channel: faker.datatype.string()
});

export const ibanList: ReadonlyArray<IbanDTO> = Array.from(
  { length: ioDevServerConfig.features.idpay.ibanSize },
  () => createRandomIbanDTO()
);

export const getRandomIban = (): IbanDTO | undefined => {
  if (ibanList.length === 0) {
    return undefined;
  }
  return ibanList[faker.datatype.number(ibanList.length)];
};
