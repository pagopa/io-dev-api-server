import { pipe } from "fp-ts/lib/function";
import { IbanDTO } from "../../../../generated/definitions/idpay/IbanDTO";
import { IbanListDTO } from "../../../../generated/definitions/idpay/IbanListDTO";
import faker from "faker/locale/it";

const createRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban(),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.companyName(),
  description: faker.random.words(5),
  channel: faker.datatype.string()
});

export const getIbanListResponse: IbanListDTO = pipe(
  Array.from({ length: 10 }, () => createRandomIbanDTO()),
  ibanList => ({ ibanList })
);
