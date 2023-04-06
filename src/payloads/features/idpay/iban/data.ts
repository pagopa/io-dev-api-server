import { faker } from "@faker-js/faker/locale/it";
import { IbanDTO } from "../../../../../generated/definitions/idpay/IbanDTO";

const createRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban(),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.companyName(),
  description: faker.company.bs(),
  channel: faker.datatype.string()
});

export const ibanList: ReadonlyArray<IbanDTO> = Array.from({ length: 5 }, () =>
  createRandomIbanDTO()
);
