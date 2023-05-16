import { faker } from "@faker-js/faker/locale/it";
import { IbanDTO } from "../../../../../generated/definitions/idpay/IbanDTO";
import { ioDevServerConfig } from "../../../../config";

const idPayConfig = ioDevServerConfig.features.idpay;

const generateRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban(false, "IT"),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.name(),
  description: faker.company.bs(),
  channel: faker.datatype.string()
});

let ibanList: ReadonlyArray<IbanDTO> = Array.from(
  { length: idPayConfig.ibanSize },
  () => generateRandomIbanDTO()
);

export const getIbanList = () => ibanList;

export const storeIban = (iban: string, description: string) => {
  if (!ibanList.some(i => i.iban === iban)) {
    ibanList = [...ibanList, { ...generateRandomIbanDTO(), iban, description }];
  }
};
