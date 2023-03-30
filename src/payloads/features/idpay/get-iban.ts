import { IbanDTO } from "../../../../generated/definitions/idpay/IbanDTO";
import faker from "faker/locale/it";

export const getIbanResponse: IbanDTO = {
  iban: faker.finance.iban(),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.companyName(),
  description: faker.random.words(5),
  channel: faker.datatype.string()
};
