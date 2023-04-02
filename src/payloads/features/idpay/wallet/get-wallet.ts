import { ulid } from "ulid";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { WalletDTO } from "../../../../../generated/definitions/idpay/WalletDTO";
import faker from "faker/locale/it";
import { IDPayInitiativeID } from "./types";

export const getWalletResponse: WalletDTO = {
  initiativeList: [
    {
      initiativeId: IDPayInitiativeID.NO_CONFIGURATION,
      initiativeName: "Iniziativa da configurare",
      status: StatusEnum.NOT_REFUNDABLE,
      endDate: faker.date.future(1),
      amount: 0,
      accrued: 0,
      refunded: 0,
      lastCounterUpdate: faker.date.recent(1),
      iban: undefined,
      nInstr: 0
    }
  ]
};
