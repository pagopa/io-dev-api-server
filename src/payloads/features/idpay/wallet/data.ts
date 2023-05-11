import { faker } from "@faker-js/faker/locale/it";
import { ulid } from "ulid";
import { AccumulatedTypeEnum } from "../../../../../generated/definitions/idpay/AccumulatedAmountDTO";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatus
} from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../../generated/definitions/idpay/InitiativeDetailDTO";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatus
} from "../../../../../generated/definitions/idpay/InstrumentDTO";
import { TimeTypeEnum } from "../../../../../generated/definitions/idpay/TimeParameterDTO";
import { WalletV2 } from "../../../../../generated/definitions/pagopa/WalletV2";
import { IDPayInitiativeID, IDPayInitiativeID as InitiativeId } from "../types";
import { initiativeIdToString } from "../utils";
import { ibanList } from "../iban/data";
import { getRandomEnumValue } from "../../../utils/random";
import { RewardValueTypeEnum } from "../../../../../generated/definitions/idpay/RewardValueDTO";

const INSTRUMENT_STATUS_TIMEOUT = 10000;

let instrumentList: { [id: number]: ReadonlyArray<InstrumentDTO> } = {
  [InitiativeId.NOT_CONFIGURED]: [],
  [InitiativeId.CONFIGURED]: [
    {
      instrumentId: ulid(),
      activationDate: faker.date.past(1),
      idWallet: "2",
      status: InstrumentStatus.ACTIVE
    }
  ],
  [InitiativeId.UNSUBSCRIBED]: []
};

const generateRandomInitiative = (): InitiativeDTO => {
  const amount = faker.datatype.number({ min: 50, max: 200, precision: 10 });
  const accrued = faker.datatype.number({ max: 200, precision: 10 });
  const refunded = faker.datatype.number({ max: accrued, precision: 10 });

  return {
    initiativeId: ulid(),
    initiativeName: faker.company.catchPhrase(),
    status: getRandomEnumValue(InitiativeStatus),
    endDate: faker.date.future(1),
    amount,
    accrued,
    refunded,
    lastCounterUpdate: faker.date.recent(1),
    iban: faker.helpers.arrayElement(ibanList)?.iban || "",
    nInstr: faker.datatype.number(2),
    logoURL: faker.helpers.maybe(() => faker.image.image(480, 480, true)),
    organizationName: faker.company.name()
  };
};

let initiativeList: { [id: number]: InitiativeDTO } = {
  [InitiativeId.CONFIGURED]: {
    ...generateRandomInitiative(),
    initiativeId: initiativeIdToString(InitiativeId.CONFIGURED),
    initiativeName: "Iniziativa di test",
    status: InitiativeStatus.REFUNDABLE,
    nInstr: (instrumentList[InitiativeId.CONFIGURED] ?? []).length
  },
  [InitiativeId.NOT_CONFIGURED]: {
    ...generateRandomInitiative(),
    initiativeId: initiativeIdToString(InitiativeId.NOT_CONFIGURED),
    initiativeName: "Iniziativa da configurare",
    status: InitiativeStatus.NOT_REFUNDABLE,
    accrued: 0,
    refunded: 0,
    iban: undefined,
    nInstr: 0
  },
  [InitiativeId.UNSUBSCRIBED]: {
    ...generateRandomInitiative(),
    initiativeId: initiativeIdToString(InitiativeId.UNSUBSCRIBED),
    initiativeName: "Iniziativa disiscritta",
    status: InitiativeStatus.UNSUBSCRIBED
  },
  [InitiativeId.SUSPENDED]: {
    ...generateRandomInitiative(),
    initiativeId: initiativeIdToString(InitiativeId.SUSPENDED),
    initiativeName: "Iniziativa sospesa",
    status: InitiativeStatus.SUSPENDED
  }
};

const generateRandomInitiativeDetails = (): InitiativeDetailDTO => ({
  initiativeName: faker.company.name(),
  status: "",
  description: faker.lorem.paragraphs(6),
  ruleDescription: faker.lorem.paragraphs(4),
  endDate: faker.date.future(1),
  rankingStartDate: faker.date.past(1),
  rankingEndDate: faker.date.future(1),
  rewardRule: {
    rewardValueType: getRandomEnumValue(RewardValueTypeEnum),
    rewardValue: faker.datatype.number(100)
  },
  refundRule: {
    accumulatedAmount: {
      accumulatedType: AccumulatedTypeEnum.BUDGET_EXHAUSTED,
      refundThreshold: 10
    },
    timeParameter: { timeType: TimeTypeEnum.MONTHLY }
  },
  privacyLink: faker.internet.url(),
  tcLink: faker.internet.url(),
  logoURL: faker.image.avatar(),
  updateDate: faker.date.recent(1)
});

const initiativeDetailsList: { [id: number]: InitiativeDetailDTO } = {
  [InitiativeId.NOT_CONFIGURED]: {
    ...generateRandomInitiativeDetails(),
    initiativeName: "Iniziativa da configurare"
  },
  [InitiativeId.CONFIGURED]: {
    ...generateRandomInitiativeDetails(),
    initiativeName: "Iniziativa a rimborso"
  },
  [InitiativeId.SUSPENDED]: {
    ...generateRandomInitiativeDetails(),
    initiativeName: "Iniziativa sospesa"
  }
};

const addIbanToInitiative = (id: InitiativeId, iban: string) => {
  initiativeList[id] = { ...initiativeList[id], iban };
};

const addInstrumentToInitiative = (
  id: InitiativeId,
  wallet: WalletV2
): boolean => {
  const exists = instrumentList[id].some(
    i => i.idWallet === wallet.idWallet?.toString()
  );

  if (exists) {
    return false;
  }

  instrumentList[id] = [
    ...instrumentList[id],
    {
      instrumentId: ulid(),
      idWallet: wallet.idWallet?.toString(),
      activationDate: new Date(),
      status: InstrumentStatus.PENDING_ENROLLMENT_REQUEST
    }
  ];

  setTimeout(() => {
    const index = instrumentList[id].findIndex(
      i => i.idWallet === wallet.idWallet?.toString()
    );

    instrumentList[id] = [
      ...instrumentList[id].slice(0, index),
      {
        ...instrumentList[id][index],
        status: InstrumentStatus.ACTIVE
      },
      ...instrumentList[id].slice(index + 1)
    ];
  }, INSTRUMENT_STATUS_TIMEOUT);

  return true;
};

const removeInstrumentFromInitiative = (
  id: InitiativeId,
  instrumentId: string
): boolean => {
  const index = instrumentList[id].findIndex(
    i => i.instrumentId === instrumentId
  );

  if (
    index < 0 ||
    instrumentList[id][index].status !== InstrumentStatus.ACTIVE
  ) {
    return false;
  }

  instrumentList[id] = [
    ...instrumentList[id].slice(0, index),
    {
      ...instrumentList[id][index],
      status: InstrumentStatus.PENDING_DEACTIVATION_REQUEST
    },
    ...instrumentList[id].slice(index + 1)
  ];

  setTimeout(() => {
    const index = instrumentList[id].findIndex(
      i => i.instrumentId === instrumentId
    );

    instrumentList[id] = [
      ...instrumentList[id].slice(0, index),
      ...instrumentList[id].slice(index + 1)
    ];
  }, INSTRUMENT_STATUS_TIMEOUT);

  return true;
};

const unsubscribeFromInitiative = (id: IDPayInitiativeID) => {
  const initiative = initiativeList[id];

  if (!initiative || initiative.status === InitiativeStatus.UNSUBSCRIBED) {
    return false;
  }

  initiativeList[id] = {
    ...initiativeList[id],
    status: InitiativeStatus.UNSUBSCRIBED
  };

  return true;
};

export {
  initiativeList,
  instrumentList,
  initiativeDetailsList,
  addIbanToInitiative,
  addInstrumentToInitiative,
  removeInstrumentFromInitiative,
  unsubscribeFromInitiative
};
