import { faker } from "@faker-js/faker/locale/it";
import { IbanDTO } from "../../../../../generated/definitions/idpay/IbanDTO";
import { ioDevServerConfig } from "../../../../config";

const createRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban(false, "IT"),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.name(),
  description: faker.company.bs(),
  channel: faker.datatype.string()
});

let ibanList: ReadonlyArray<IbanDTO> = Array.from(
  { length: ioDevServerConfig.features.idpay.ibanSize },
  () => createRandomIbanDTO()
);

const storeIban = (iban: string, description: string) => {
  if (!ibanList.some(i => i.iban === iban)) {
    ibanList = [...ibanList, { ...createRandomIbanDTO(), iban, description }];
  }
};

export { ibanList, storeIban };
