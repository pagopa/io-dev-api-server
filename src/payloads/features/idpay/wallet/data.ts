import { ulid } from "ulid";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { WalletDTO } from "../../../../../generated/definitions/idpay/WalletDTO";
import faker from "faker/locale/it";
import { initiativeIdToString } from "../utils";
import { IDPayInitiativeID } from "../types";

export const initiativeList: { [id: number]: InitiativeDTO } = {
  [IDPayInitiativeID.NO_CONFIGURATION]: {
    initiativeId: initiativeIdToString(IDPayInitiativeID.NO_CONFIGURATION),
    initiativeName: "Iniziativa da configurare",
    status: StatusEnum.NOT_REFUNDABLE,
    endDate: faker.date.future(1),
    amount: 0,
    accrued: 0,
    refunded: 0,
    lastCounterUpdate: faker.date.recent(1),
    iban: undefined,
    nInstr: 0
  },
  [IDPayInitiativeID.CONFIGURED]: {
    initiativeId: initiativeIdToString(IDPayInitiativeID.CONFIGURED),
    initiativeName: "Iniziativa di test",
    status: StatusEnum.REFUNDABLE,
    endDate: faker.date.future(1),
    amount: 0,
    accrued: 0,
    refunded: 0,
    lastCounterUpdate: faker.date.recent(1),
    iban: undefined,
    nInstr: 0
  }
};
