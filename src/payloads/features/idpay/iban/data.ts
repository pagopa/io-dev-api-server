import faker from "faker/locale/it";
import { IbanDTO } from "../../../../../generated/definitions/idpay/IbanDTO";

const createRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban(),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.companyName(),
  description: faker.random.words(5),
  channel: faker.datatype.string()
});

export const ibanList: ReadonlyArray<IbanDTO> = Array.from({ length: 10 }, () =>
  createRandomIbanDTO()
);
