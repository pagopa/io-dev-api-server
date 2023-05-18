import { faker } from "@faker-js/faker/locale/it";
import { range } from "lodash";
import { ulid } from "ulid";
import { AccumulatedTypeEnum } from "../../generated/definitions/idpay/AccumulatedAmountDTO";
import { IbanDTO } from "../../generated/definitions/idpay/IbanDTO";
import {
  IbanOperationDTO,
  OperationTypeEnum as IbanOperationEnum
} from "../../generated/definitions/idpay/IbanOperationDTO";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum as InitiativeStatus
} from "../../generated/definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../generated/definitions/idpay/InitiativeDetailDTO";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatus
} from "../../generated/definitions/idpay/InstrumentDTO";
import {
  InstrumentOperationDTO,
  OperationTypeEnum as InstrumentOperationEnum
} from "../../generated/definitions/idpay/InstrumentOperationDTO";
import {
  OnboardingOperationDTO,
  OperationTypeEnum as OnboardingOperationEnum
} from "../../generated/definitions/idpay/OnboardingOperationDTO";
import { OperationDTO } from "../../generated/definitions/idpay/OperationDTO";
import { OperationListDTO } from "../../generated/definitions/idpay/OperationListDTO";
import { RefundDetailDTO } from "../../generated/definitions/idpay/RefundDetailDTO";
import {
  RefundOperationDTO,
  OperationTypeEnum as RefundOperationEnum
} from "../../generated/definitions/idpay/RefundOperationDTO";
import {
  RejectedInstrumentOperationDTO,
  OperationTypeEnum as RejectedInstrumentOperationEnum
} from "../../generated/definitions/idpay/RejectedInstrumentOperationDTO";
import { RewardValueTypeEnum } from "../../generated/definitions/idpay/RewardValueDTO";
import { TimeTypeEnum } from "../../generated/definitions/idpay/TimeParameterDTO";
import {
  TransactionDetailDTO,
  OperationTypeEnum as TransactionDetailEnum
} from "../../generated/definitions/idpay/TransactionDetailDTO";
import {
  TransactionOperationDTO,
  OperationTypeEnum as TransactionOperationEnum
} from "../../generated/definitions/idpay/TransactionOperationDTO";
import { CardInfo } from "../../generated/definitions/pagopa/CardInfo";
import { WalletV2 } from "../../generated/definitions/pagopa/WalletV2";
import { ioDevServerConfig } from "../config";
import { getRandomEnumValue } from "../payloads/utils/random";
import { getWalletV2 } from "../routers/walletsV2";

const idPayConfig = ioDevServerConfig.features.idpay;
const walletConfig = ioDevServerConfig.wallet.idPay;

const pagoPaWallet: WalletV2 = getWalletV2()[0];
const pagoPaWalletInfo: CardInfo = pagoPaWallet.info as CardInfo;

const generateRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban(false, "IT"),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.name(),
  description: faker.company.bs(),
  channel: faker.datatype.string()
});

export let ibanList: ReadonlyArray<IbanDTO> = Array.from(
  { length: idPayConfig.ibanSize },
  () => generateRandomIbanDTO()
);

export const storeIban = (iban: string, description: string) =>
  (ibanList = [...ibanList, { ...generateRandomIbanDTO(), iban, description }]);

export let instruments: {
  [initiativeId: string]: ReadonlyArray<InstrumentDTO>;
} = {};

export const enrollInstrumentToInitiative = (
  initiativeId: string,
  wallet: WalletV2
): boolean => {
  const initiativeInstruments = instruments[initiativeId] || [];

  const isAlreadyEnrolled = initiativeInstruments.some(
    i => i.idWallet === wallet.idWallet?.toString()
  );

  if (isAlreadyEnrolled) {
    return false;
  }

  instruments[initiativeId] = [
    ...initiativeInstruments,
    {
      instrumentId: ulid(),
      idWallet: wallet.idWallet?.toString(),
      activationDate: new Date(),
      status: InstrumentStatus.PENDING_ENROLLMENT_REQUEST
    }
  ];

  setTimeout(() => {
    const initiativeInstruments = instruments[initiativeId] || [];

    const index = initiativeInstruments.findIndex(
      i => i.idWallet === wallet.idWallet?.toString()
    );

    instruments[initiativeId] = [
      ...initiativeInstruments.slice(0, index),
      {
        ...initiativeInstruments[index],
        status: InstrumentStatus.ACTIVE
      },
      ...initiativeInstruments.slice(index + 1)
    ];
  }, 5000);

  return true;
};

export const deleteInstrumentFromInitiative = (
  initiativeId: string,
  instrumentId: string
): boolean => {
  const initiativeInstruments = instruments[initiativeId] || [];

  const index = initiativeInstruments.findIndex(
    i => i.instrumentId === instrumentId
  );

  if (
    index < 0 ||
    initiativeInstruments[index].status !== InstrumentStatus.ACTIVE
  ) {
    return false;
  }

  instruments[initiativeId] = [
    ...initiativeInstruments.slice(0, index),
    {
      ...initiativeInstruments[index],
      status: InstrumentStatus.PENDING_DEACTIVATION_REQUEST
    },
    ...initiativeInstruments.slice(index + 1)
  ];

  setTimeout(() => {
    const initiativeInstruments = instruments[initiativeId] || [];

    const index = initiativeInstruments.findIndex(
      i => i.instrumentId === instrumentId
    );

    instruments[initiativeId] = [
      ...initiativeInstruments.slice(0, index),
      ...initiativeInstruments.slice(index + 1)
    ];
  }, 5000);

  return true;
};

const rejectedRefundOperation: RefundOperationDTO = {
  operationType: RefundOperationEnum.REJECTED_REFUND,
  operationDate: new Date(),
  operationId: ulid(),
  eventId: ulid(),
  amount: 10
};

const rejectedRefundOperationDetail: RefundDetailDTO = {
  ...rejectedRefundOperation,
  cro: ulid(),
  iban: faker.finance.iban(false, "IT"),
  startDate: faker.date.recent(),
  endDate: faker.date.recent(),
  transferDate: faker.date.recent()
};

const paidRefundOperation: RefundOperationDTO = {
  operationType: RefundOperationEnum.PAID_REFUND,
  operationDate: new Date(),
  operationId: ulid(),
  eventId: ulid(),
  amount: 10
};

const paidRefundOperationDetail: RefundDetailDTO = {
  ...paidRefundOperation,
  cro: ulid(),
  iban: faker.finance.iban(false, "IT"),
  startDate: faker.date.recent(),
  endDate: faker.date.recent(),
  transferDate: faker.date.recent()
};

const reversalOperation: TransactionOperationDTO = {
  operationType: TransactionOperationEnum.REVERSAL,
  operationDate: new Date(),
  operationId: ulid(),
  accrued: 10,
  amount: 100,
  brand: pagoPaWalletInfo.brand || "VISA",
  circuitType: "01",
  brandLogo: pagoPaWalletInfo.brandLogo || "",
  maskedPan: pagoPaWalletInfo.blurredNumber || "0000"
};

const reversalOperationDetail: TransactionDetailDTO = {
  ...reversalOperation,
  operationType: TransactionDetailEnum.REVERSAL,
  idTrxAcquirer: ulid(),
  idTrxIssuer: ulid()
};

const transactionOperation: TransactionOperationDTO = {
  operationType: TransactionOperationEnum.TRANSACTION,
  operationDate: new Date(),
  operationId: ulid(),
  accrued: 10,
  amount: 100,
  brand: pagoPaWalletInfo.brand || "VISA",
  circuitType: "01",
  brandLogo: pagoPaWalletInfo.brandLogo || "",
  maskedPan: pagoPaWalletInfo.blurredNumber || "0000"
};

const transactionOperationDetail: TransactionDetailDTO = {
  ...transactionOperation,
  operationType: TransactionDetailEnum.TRANSACTION,
  idTrxAcquirer: ulid(),
  idTrxIssuer: ulid()
};

const rejectedDeleteInstrument: RejectedInstrumentOperationDTO = {
  operationType: RejectedInstrumentOperationEnum.REJECTED_DELETE_INSTRUMENT,
  operationDate: new Date(),
  operationId: ulid(),
  brand: pagoPaWalletInfo.brand || "VISA",
  brandLogo: pagoPaWalletInfo.brandLogo || "",
  channel: faker.datatype.string(),
  maskedPan: pagoPaWalletInfo.blurredNumber || "0000"
};

const rejectedAddInstrument: RejectedInstrumentOperationDTO = {
  operationType: RejectedInstrumentOperationEnum.REJECTED_ADD_INSTRUMENT,
  operationDate: new Date(),
  operationId: ulid(),
  brand: pagoPaWalletInfo.brand || "VISA",
  brandLogo: pagoPaWalletInfo.brandLogo || "",
  channel: faker.datatype.string(),
  maskedPan: pagoPaWalletInfo.blurredNumber || "0000"
};

const addIbanOperation: IbanOperationDTO = {
  operationType: IbanOperationEnum.ADD_IBAN,
  operationDate: new Date(),
  operationId: ulid(),
  channel: "",
  iban: faker.helpers.arrayElement(ibanList)?.iban || ""
};

const deleteInstrumentOperation: InstrumentOperationDTO = {
  operationType: InstrumentOperationEnum.DELETE_INSTRUMENT,
  operationDate: new Date(),
  operationId: ulid(),
  brand: pagoPaWalletInfo.brand || "VISA",
  brandLogo: pagoPaWalletInfo.brandLogo || "",
  channel: faker.datatype.string(),
  maskedPan: pagoPaWalletInfo.blurredNumber || "0000"
};

const addInstrumentOperation: InstrumentOperationDTO = {
  operationType: InstrumentOperationEnum.ADD_INSTRUMENT,
  operationDate: new Date(),
  operationId: ulid(),
  brand: pagoPaWalletInfo.brand || "VISA",
  brandLogo: pagoPaWalletInfo.brandLogo || "",
  channel: faker.datatype.string(),
  maskedPan: pagoPaWalletInfo.blurredNumber || "0000"
};

const onboardingOperation: OnboardingOperationDTO = {
  operationType: OnboardingOperationEnum.ONBOARDING,
  operationDate: new Date(),
  operationId: ulid()
};

export let initiativeTimeline: {
  [initiativeId: string]: ReadonlyArray<OperationListDTO>;
} = {};

export let initiativeTimelineDetails: {
  [initiativeId: string]: ReadonlyArray<OperationDTO>;
} = {};

export let initiatives: { [id: string]: InitiativeDTO } = {};

export let initiativesDetails: { [id: string]: InitiativeDetailDTO } = {};

export const updateInitiative = (initiative: InitiativeDTO) =>
  (initiatives[initiative.initiativeId] = initiative);

const generateRandomInitiativeDTO = (): InitiativeDTO => {
  const amount = faker.datatype.number({ min: 50, max: 200, precision: 10 });
  const accrued = faker.datatype.number({ max: 200, precision: 10 });
  const refunded = faker.datatype.number({ max: accrued, precision: 10 });

  return {
    initiativeId: ulid(),
    initiativeName: faker.company.name(),
    status: getRandomEnumValue(InitiativeStatus),
    endDate: faker.date.future(1),
    amount,
    accrued,
    initiativeRewardType: getRandomEnumValue(InitiativeRewardTypeEnum),
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

range(0, walletConfig.refundCount).forEach(() => {
  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
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
  instruments[initiativeId] = [
    {
      instrumentId: ulid(),
      idWallet: pagoPaWallet.idWallet?.toString(),
      activationDate: new Date(),
      status: InstrumentStatus.ACTIVE
    }
  ];
  initiativeTimeline[initiativeId] = [
    rejectedRefundOperation,
    paidRefundOperation,
    reversalOperation,
    transactionOperation,
    rejectedDeleteInstrument,
    rejectedAddInstrument,
    addIbanOperation,
    deleteInstrumentOperation,
    addInstrumentOperation,
    onboardingOperation
  ];
  initiativeTimelineDetails[initiativeId] = [
    rejectedRefundOperationDetail,
    paidRefundOperationDetail,
    reversalOperationDetail,
    transactionOperationDetail
  ];
});

range(0, walletConfig.refundNotConfiguredCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [NC]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
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

  initiatives[initiativeId] = initiative;
  initiativesDetails[initiativeId] = details;
  instruments[initiativeId] = [];
  initiativeTimeline[initiativeId] = [onboardingOperation];
  initiativeTimelineDetails[initiativeId] = [];
});

range(0, walletConfig.refundUnsubscribedCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [U]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
    status: InitiativeStatus.UNSUBSCRIBED
  };

  const { initiativeId } = initiative;

  const details: InitiativeDetailDTO = {
    ...generateRandomInitiativeDetailDTO(),
    initiativeName,
    status: InitiativeStatus.UNSUBSCRIBED
  };

  initiatives[initiativeId] = initiative;
  initiativesDetails[initiativeId] = details;
  instruments[initiativeId] = [
    ...(instruments[initiativeId] || []),
    {
      instrumentId: ulid(),
      idWallet: pagoPaWallet.idWallet?.toString(),
      activationDate: new Date(),
      status: InstrumentStatus.ACTIVE
    }
  ];
  initiativeTimeline[initiativeId] = [
    rejectedRefundOperation,
    paidRefundOperation,
    reversalOperation,
    transactionOperation,
    rejectedDeleteInstrument,
    rejectedAddInstrument,
    addIbanOperation,
    deleteInstrumentOperation,
    addInstrumentOperation,
    onboardingOperation
  ];
  initiativeTimelineDetails[initiativeId] = [
    rejectedRefundOperationDetail,
    paidRefundOperationDetail,
    reversalOperationDetail,
    transactionOperationDetail
  ];
});

range(0, walletConfig.refundSuspendedCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [S]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
    status: InitiativeStatus.SUSPENDED
  };

  const { initiativeId } = initiative;

  const details: InitiativeDetailDTO = {
    ...generateRandomInitiativeDetailDTO(),
    initiativeName,
    status: InitiativeStatus.SUSPENDED
  };

  initiatives[initiativeId] = initiative;
  initiativesDetails[initiativeId] = details;
  instruments[initiativeId] = [
    ...(instruments[initiativeId] || []),
    {
      instrumentId: ulid(),
      idWallet: pagoPaWallet.idWallet?.toString(),
      activationDate: new Date(),
      status: InstrumentStatus.ACTIVE
    }
  ];
  initiativeTimeline[initiativeId] = [
    rejectedRefundOperation,
    paidRefundOperation,
    reversalOperation,
    transactionOperation,
    rejectedDeleteInstrument,
    rejectedAddInstrument,
    addIbanOperation,
    deleteInstrumentOperation,
    addInstrumentOperation,
    onboardingOperation
  ];
  initiativeTimelineDetails[initiativeId] = [
    rejectedRefundOperationDetail,
    paidRefundOperationDetail,
    reversalOperationDetail,
    transactionOperationDetail
  ];
});

range(0, walletConfig.discountCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [D]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.DISCOUNT,
    status: InitiativeStatus.REFUNDABLE,
    iban: undefined,
    nInstr: 0
  };

  const { initiativeId } = initiative;

  const details: InitiativeDetailDTO = {
    ...generateRandomInitiativeDetailDTO(),
    initiativeName,
    status: InitiativeStatus.REFUNDABLE
  };

  initiatives[initiativeId] = initiative;
  initiativesDetails[initiativeId] = details;
  instruments[initiativeId] = [];
  initiativeTimeline[initiativeId] = [onboardingOperation];
  initiativeTimelineDetails[initiativeId] = [];
});
