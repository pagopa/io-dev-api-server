import faker from "faker/locale/it";
import { AccumulatedTypeEnum } from "../../../../../generated/definitions/idpay/AccumulatedAmountDTO";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatus
} from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { TimeTypeEnum } from "../../../../../generated/definitions/idpay/TimeParameterDTO";
import { IDPayInitiativeID, IDPayInitiativeID as InitiativeId } from "../types";
import { initiativeIdToString } from "../utils";
import { getIbanListResponse } from "../iban/get-iban-list";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatus
} from "../../../../../generated/definitions/idpay/InstrumentDTO";
import { ulid } from "ulid";
import { WalletV2 } from "../../../../../generated/definitions/pagopa/WalletV2";
import { getWalletV2 } from "../../../../routers/walletsV2";

const INSTRUMENT_STATUS_TIMEOUT = 10000;

let instrumentList: { [id: number]: ReadonlyArray<InstrumentDTO> } = {
  [InitiativeId.NO_CONFIGURATION]: [],
  [InitiativeId.CONFIGURED]: [
    {
      instrumentId: ulid(),
      activationDate: faker.date.past(1),
      idWallet: "2"
    }
  ]
};

let initiativeList: { [id: number]: InitiativeDTO } = {
  [InitiativeId.NO_CONFIGURATION]: {
    initiativeId: initiativeIdToString(InitiativeId.NO_CONFIGURATION),
    initiativeName: "Iniziativa da configurare",
    status: InitiativeStatus.NOT_REFUNDABLE,
    endDate: faker.date.future(1),
    amount: 100,
    accrued: 0,
    refunded: 0,
    lastCounterUpdate: faker.date.recent(1),
    iban: undefined,
    nInstr: 0
  },
  [InitiativeId.CONFIGURED]: {
    initiativeId: initiativeIdToString(InitiativeId.CONFIGURED),
    initiativeName: "Iniziativa di test",
    status: InitiativeStatus.REFUNDABLE,
    endDate: faker.date.future(1),
    amount: 30,
    accrued: 70,
    refunded: 45,
    lastCounterUpdate: faker.date.recent(1),
    iban: getIbanListResponse.ibanList[0].iban,
    nInstr: (instrumentList[InitiativeId.CONFIGURED] ?? []).length
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

const initiativeDetailsList: { [id: number]: InitiativeDetailDTO } = {
  [InitiativeId.NO_CONFIGURATION]: {
    ...createRandomInitiativeDetails(),
    initiativeName: "Iniziativa da configurare"
  },
  [InitiativeId.CONFIGURED]: {
    ...createRandomInitiativeDetails(),
    initiativeName: "Iniziativa di test"
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
  if (!initiativeList[id]) {
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
