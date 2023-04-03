import { ulid } from "ulid";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { WalletDTO } from "../../../../../generated/definitions/idpay/WalletDTO";
import faker from "faker/locale/it";
import { initiativeIdToString } from "../utils";
import { IDPayInitiativeID } from "../types";
import { InitiativeDetailDTO } from "../../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { TimeTypeEnum } from "../../../../../generated/definitions/idpay/TimeParameterDTO";
import { AccumulatedTypeEnum } from "../../../../../generated/definitions/idpay/AccumulatedAmountDTO";

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

const createRandomInitiativeDetails = (): InitiativeDetailDTO => ({
  initiativeName: faker.company.companyName(),
  status: "",
  description: faker.lorem.paragraphs(6),
  ruleDescription: faker.lorem.paragraphs(4),
  endDate: faker.date.future(1),
  rankingStartDate: faker.date.past(1),
  rankingEndDate: faker.date.future(1),
  rewardRule: {},
  refundRule: {
    accumulatedAmount: {
      accumulatedType: AccumulatedTypeEnum.BUDGET_EXHAUSTED,
      refundThreshold: 10
    },
    timeParameter: { timeType: TimeTypeEnum.MONTHLY }
  },
  privacyLink: "https://google.it",
  tcLink: "https://google.it",
  logoURL: "https://google.it",
  updateDate: faker.date.recent(1)
});

export const initiativeDetailList: { [id: number]: InitiativeDetailDTO } = {
  [IDPayInitiativeID.NO_CONFIGURATION]: {
    ...createRandomInitiativeDetails(),
    initiativeName: "Iniziativa da configurare"
  },
  [IDPayInitiativeID.CONFIGURED]: {
    ...createRandomInitiativeDetails(),
    initiativeName: "Iniziativa di test"
  }
};
