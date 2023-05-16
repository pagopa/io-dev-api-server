import { faker } from "@faker-js/faker/locale/it";
import { range } from "lodash";
import { ulid } from "ulid";
import { AccumulatedTypeEnum } from "../../../../../generated/definitions/idpay/AccumulatedAmountDTO";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatus
} from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { RewardValueTypeEnum } from "../../../../../generated/definitions/idpay/RewardValueDTO";
import { TimeTypeEnum } from "../../../../../generated/definitions/idpay/TimeParameterDTO";
import { ioDevServerConfig } from "../../../../config";
import { getWalletV2 } from "../../../../routers/walletsV2";
import { getRandomEnumValue } from "../../../utils/random";
import { addInstrumentToInitiative } from "../instrument/data";
import { generateInitiativeTimeline } from "../timeline/data";
import { getIbanList } from "../iban/data";

const config = ioDevServerConfig.wallet.idPay;

let initiatives: { [id: string]: InitiativeDTO } = {};
let initiativesDetails: { [id: string]: InitiativeDetailDTO } = {};

const generateRandomInitiativeDTO = (): InitiativeDTO => {
  const amount = faker.datatype.number({ min: 50, max: 200, precision: 10 });
  const accrued = faker.datatype.number({ max: 200, precision: 10 });
  const refunded = faker.datatype.number({ max: accrued, precision: 10 });

  const ibanList = getIbanList();

  return {
    initiativeId: ulid(),
    initiativeName: faker.company.name(),
    status: getRandomEnumValue(InitiativeStatus),
    endDate: faker.date.future(1),
    amount,
    accrued,
    refunded,
    lastCounterUpdate: faker.date.recent(1),
    iban: faker.helpers.arrayElement(ibanList)?.iban || "",
    nInstr: 1,
    logoURL: faker.image.image(480, 480, true),
    organizationName: faker.company.name()
  };
};

const generateRandomInitiativeDetailDTO = (): InitiativeDetailDTO => ({
  initiativeName: faker.company.name(),
  status: getRandomEnumValue(InitiativeStatus),
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
      accumulatedType: getRandomEnumValue(AccumulatedTypeEnum),
      refundThreshold: faker.datatype.number({ min: 10, max: 50 })
    },
    timeParameter: { timeType: getRandomEnumValue(TimeTypeEnum) }
  },
  privacyLink: faker.internet.url(),
  tcLink: faker.internet.url(),
  logoURL: faker.image.avatar(),
  updateDate: faker.date.recent(1)
});

range(0, config.configuredCount).forEach(() => {
  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    status: InitiativeStatus.REFUNDABLE
  };

  const { initiativeId, initiativeName } = initiative;

  const details: InitiativeDetailDTO = {
    ...generateRandomInitiativeDetailDTO(),
    initiativeName,
    status: InitiativeStatus.REFUNDABLE
  };

  initiatives[initiativeId] = initiative;
  initiativesDetails[initiativeId] = details;

  generateInitiativeTimeline(initiativeId);

  const pagoPaWallet = getWalletV2();
  if (pagoPaWallet.length > 0) {
    addInstrumentToInitiative(initiativeId, getWalletV2()[0]);
  }
});

range(0, config.notConfiguredCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [NC]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    status: InitiativeStatus.NOT_REFUNDABLE,
    iban: undefined,
    nInstr: 0
  };

  const { initiativeId } = initiative;

  const details: InitiativeDetailDTO = {
    ...generateRandomInitiativeDetailDTO(),
    initiativeName,
    status: InitiativeStatus.NOT_REFUNDABLE
  };

  generateInitiativeTimeline(initiativeId, false);

  initiatives[initiativeId] = initiative;
  initiativesDetails[initiativeId] = details;
});

range(0, config.unsubscribedCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [U]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    status: InitiativeStatus.UNSUBSCRIBED
  };

  const { initiativeId } = initiative;

  const details: InitiativeDetailDTO = {
    ...generateRandomInitiativeDetailDTO(),
    initiativeName,
    status: InitiativeStatus.UNSUBSCRIBED
  };

  generateInitiativeTimeline(initiativeId);

  initiatives[initiativeId] = initiative;
  initiativesDetails[initiativeId] = details;

  const pagoPaWallet = getWalletV2();
  if (pagoPaWallet.length > 0) {
    addInstrumentToInitiative(initiativeId, getWalletV2()[0]);
  }
});

range(0, config.suspendedCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [S]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    status: InitiativeStatus.SUSPENDED
  };

  const { initiativeId } = initiative;

  const details: InitiativeDetailDTO = {
    ...generateRandomInitiativeDetailDTO(),
    initiativeName,
    status: InitiativeStatus.SUSPENDED
  };

  generateInitiativeTimeline(initiativeId);

  initiatives[initiativeId] = initiative;
  initiativesDetails[initiativeId] = details;

  const pagoPaWallet = getWalletV2();
  if (pagoPaWallet.length > 0) {
    addInstrumentToInitiative(initiativeId, getWalletV2()[0]);
  }
});

export const getInitiatives = () => initiatives;

export const getInitiative = (id: string): InitiativeDTO | undefined =>
  initiatives[id];

export const getInitiativeDetails = (
  id: string
): InitiativeDetailDTO | undefined => initiativesDetails[id];

export const addIbanToInitiative = (id: string, iban: string) => {
  initiatives[id] = { ...initiatives[id], iban };
};

export const unsubscribeFromInitiative = (id: string) => {
  const initiative = initiatives[id];

  if (!initiative || initiative.status === InitiativeStatus.UNSUBSCRIBED) {
    return false;
  }

  initiatives[id] = {
    ...initiatives[id],
    status: InitiativeStatus.UNSUBSCRIBED
  };

  return true;
};
