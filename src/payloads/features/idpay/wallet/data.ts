import faker from "faker/locale/it";
import { AccumulatedTypeEnum } from "../../../../../generated/definitions/idpay/AccumulatedAmountDTO";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { TimeTypeEnum } from "../../../../../generated/definitions/idpay/TimeParameterDTO";
import { IDPayInitiativeID as InitiativeId } from "../types";
import { initiativeIdToString } from "../utils";
import { getIbanListResponse } from "../iban/get-iban-list";
import { InstrumentListDTO } from "../../../../../generated/definitions/idpay/InstrumentListDTO";

export const instrumentList: { [id: number]: InstrumentListDTO } = {};

export var initiativeList: { [id: number]: InitiativeDTO } = {
  [InitiativeId.NO_CONFIGURATION]: {
    initiativeId: initiativeIdToString(InitiativeId.NO_CONFIGURATION),
    initiativeName: "Iniziativa da configurare",
    status: StatusEnum.NOT_REFUNDABLE,
    endDate: faker.date.future(1),
    amount: 0,
    accrued: 0,
    refunded: 0,
    lastCounterUpdate: faker.date.recent(1),
    iban: getIbanListResponse.ibanList[0].iban,
    nInstr:
      instrumentList[InitiativeId.NO_CONFIGURATION]?.instrumentList.length || 0
  },
  [InitiativeId.CONFIGURED]: {
    initiativeId: initiativeIdToString(InitiativeId.CONFIGURED),
    initiativeName: "Iniziativa di test",
    status: StatusEnum.REFUNDABLE,
    endDate: faker.date.future(1),
    amount: 0,
    accrued: 0,
    refunded: 0,
    lastCounterUpdate: faker.date.recent(1),
    iban: undefined,
    nInstr: instrumentList[InitiativeId.CONFIGURED]?.instrumentList.length || 0
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
  [InitiativeId.NO_CONFIGURATION]: {
    ...createRandomInitiativeDetails(),
    initiativeName: "Iniziativa da configurare"
  },
  [InitiativeId.CONFIGURED]: {
    ...createRandomInitiativeDetails(),
    initiativeName: "Iniziativa di test"
  }
};

export const addIbanToInitiative = (id: InitiativeId, iban: string) => {
  initiativeList[id] = { ...initiativeList[id], iban };
};
