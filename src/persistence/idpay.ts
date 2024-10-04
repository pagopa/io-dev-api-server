import { faker } from "@faker-js/faker/locale/it";
import { range } from "lodash";
import { ulid } from "ulid";
import { IbanDTO } from "../../generated/definitions/idpay/IbanDTO";
import {
  IbanOperationDTO,
  OperationTypeEnum as IbanOperationTypeEnum
} from "../../generated/definitions/idpay/IbanOperationDTO";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum as InitiativeStatus
} from "../../generated/definitions/idpay/InitiativeDTO";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatus,
  InstrumentTypeEnum
} from "../../generated/definitions/idpay/InstrumentDTO";
import {
  InstrumentOperationDTO,
  OperationTypeEnum as InstrumentOperationTypeEnum,
  InstrumentTypeEnum as InstrumentOperationInstrumentTypeEnum
} from "../../generated/definitions/idpay/InstrumentOperationDTO";
import {
  OnboardingOperationDTO,
  OperationTypeEnum as OnboardingOperationTypeEnum
} from "../../generated/definitions/idpay/OnboardingOperationDTO";
import { OperationListDTO } from "../../generated/definitions/idpay/OperationListDTO";
import {
  ReadmittedOperationDTO,
  OperationTypeEnum as ReadmittedOperationTypeEnum
} from "../../generated/definitions/idpay/ReadmittedOperationDTO";
import {
  RefundOperationDTO,
  OperationTypeEnum as RefundOperationTypeEnum
} from "../../generated/definitions/idpay/RefundOperationDTO";
import {
  InstrumentTypeEnum as OperationInstrumentTypeEnum,
  RejectedInstrumentOperationDTO,
  OperationTypeEnum as RejectedInstrumentOperationTypeEnum
} from "../../generated/definitions/idpay/RejectedInstrumentOperationDTO";
import {
  SuspendOperationDTO,
  OperationTypeEnum as SuspendOperationTypeEnum
} from "../../generated/definitions/idpay/SuspendOperationDTO";
import {
  ChannelEnum as TransactionChannelEnum,
  TransactionOperationDTO,
  OperationTypeEnum as TransactionOperationTypeEnum,
  StatusEnum as TransactionStatusEnum
} from "../../generated/definitions/idpay/TransactionOperationDTO";
import { WalletV2 } from "../../generated/definitions/pagopa/WalletV2";
import { ioDevServerConfig } from "../config";
import { getRandomEnumValue } from "../payloads/utils/random";
import { getWalletV2 } from "../routers/walletsV2";
import { creditCardBrands, getCreditCardLogo } from "../utils/payment";
import {
  StatusEnum,
  TransactionBarCodeResponse
} from "../../generated/definitions/idpay/TransactionBarCodeResponse";

const idPayConfig = ioDevServerConfig.features.idpay;
const { idPay: walletConfig } = ioDevServerConfig.wallet;

const pagoPaWallet: WalletV2 = getWalletV2()[0];

const generateRandomInitiativeDTO = (): InitiativeDTO => {
  const amountCents = faker.datatype.number({ min: 500, max: 200 });
  const accruedCents = faker.datatype.number({ max: 20000 });
  const refundedCents = faker.datatype.number({ max: accruedCents });

  return {
    initiativeId: ulid(),
    initiativeName: faker.company.name(),
    status: getRandomEnumValue(InitiativeStatus),
    endDate: faker.date.future(1),
    amountCents,
    accruedCents,
    initiativeRewardType: getRandomEnumValue(InitiativeRewardTypeEnum),
    refundedCents,
    lastCounterUpdate: faker.date.recent(1),
    iban: faker.helpers.arrayElement(ibanList)?.iban || "",
    nInstr: 1,
    logoURL: faker.image.image(480, 480, true),
    organizationName: faker.company.name()
  };
};

const generateRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban(false, "IT"),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.name(),
  description: faker.company.bs(),
  channel: faker.datatype.string()
});

const generateRandomTransactionOperationDTO = (
  withInfo?: Partial<TransactionOperationDTO>
): TransactionOperationDTO => {
  const brand = faker.helpers.arrayElement(creditCardBrands);
  const brandLogo = getCreditCardLogo(brand);
  const maskedPan = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  return {
    operationType: getRandomEnumValue(TransactionOperationTypeEnum),
    operationDate: new Date(),
    operationId: ulid(),
    accruedCents: faker.datatype.number({ min: 500, max: 2500 }),
    amountCents: faker.datatype.number({ min: 5000, max: 10000 }),
    brand,
    circuitType: "01",
    brandLogo,
    maskedPan,
    status: getRandomEnumValue(TransactionStatusEnum),
    channel: getRandomEnumValue(TransactionChannelEnum),
    businessName: faker.company.name(),
    eventId: ulid(),
    ...withInfo
  };
};

const generateRandomRefundOperationDTO = (
  withInfo?: Partial<RefundOperationDTO>
): RefundOperationDTO => ({
  operationType: getRandomEnumValue(RefundOperationTypeEnum),
  operationDate: new Date(),
  operationId: ulid(),
  eventId: ulid(),
  amountCents: faker.datatype.number({ min: 500, max: 10000 }),
  ...withInfo
});

const generateRandomIbanOperationDTO = (): IbanOperationDTO => ({
  operationType: IbanOperationTypeEnum.ADD_IBAN,
  operationDate: new Date(),
  operationId: ulid(),
  channel: faker.datatype.string(),
  iban: faker.helpers.arrayElement(ibanList)?.iban || ""
});

const generateRandomOnboardingOperationDTO = (): OnboardingOperationDTO => ({
  operationType: OnboardingOperationTypeEnum.ONBOARDING,
  operationDate: new Date(),
  operationId: ulid()
});

const generateRandomInstrumentOperationDTO = (
  withInfo?: Partial<InstrumentOperationDTO>
): InstrumentOperationDTO => {
  const brand = faker.helpers.arrayElement(creditCardBrands);
  const brandLogo = getCreditCardLogo(brand);
  const maskedPan = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  return {
    operationType: getRandomEnumValue(InstrumentOperationTypeEnum),
    operationDate: new Date(),
    operationId: ulid(),
    brand,
    brandLogo,
    channel: getRandomEnumValue(TransactionChannelEnum),
    maskedPan,
    instrumentType: getRandomEnumValue(OperationInstrumentTypeEnum),
    ...withInfo
  };
};

const generateRandomRejectedInstrumentOperationDTO = (
  withInfo?: Partial<RejectedInstrumentOperationDTO>
): RejectedInstrumentOperationDTO => {
  const brand = faker.helpers.arrayElement(creditCardBrands);
  const brandLogo = getCreditCardLogo(brand);
  const maskedPan = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  return {
    operationType: getRandomEnumValue(RejectedInstrumentOperationTypeEnum),
    operationDate: new Date(),
    operationId: ulid(),
    brand,
    brandLogo,
    channel: getRandomEnumValue(TransactionChannelEnum),
    maskedPan,
    instrumentType: getRandomEnumValue(OperationInstrumentTypeEnum),
    ...withInfo
  };
};

const generateRandomSuspendOperationDTO = (): SuspendOperationDTO => ({
  operationType: SuspendOperationTypeEnum.SUSPENDED,
  operationDate: new Date(),
  operationId: ulid()
});

const generateRandomReadmittedOperationDTO = (): ReadmittedOperationDTO => ({
  operationType: ReadmittedOperationTypeEnum.READMITTED,
  operationDate: new Date(),
  operationId: ulid()
});

// eslint-disable-next-line functional/no-let
export let initiatives: { [id: string]: InitiativeDTO } = {};

// eslint-disable-next-line functional/no-let
export let initiativeTimeline: {
  [initiativeId: string]: ReadonlyArray<OperationListDTO>;
} = {};

// eslint-disable-next-line functional/no-let
export let ibanList: ReadonlyArray<IbanDTO> = Array.from(
  { length: idPayConfig.ibanSize },
  () => generateRandomIbanDTO()
);

// eslint-disable-next-line functional/no-let
export let instruments: {
  [initiativeId: string]: ReadonlyArray<InstrumentDTO>;
} = {};

export const storeIban = (iban: string, description: string) =>
  (ibanList = [...ibanList, { ...generateRandomIbanDTO(), iban, description }]);

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

  const instrumentId = ulid();

  instruments = {
    ...instruments,
    [initiativeId]: [
      ...initiativeInstruments,
      {
        instrumentId,
        idWallet: wallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.PENDING_ENROLLMENT_REQUEST,
        instrumentType: InstrumentTypeEnum.CARD
      }
    ]
  };

  setTimeout(() => {
    const initiativeInstruments = instruments[initiativeId] || [];

    const index = initiativeInstruments.findIndex(
      i => i.instrumentId === instrumentId
    );

    instruments = {
      ...instruments,
      [initiativeId]: [
        ...initiativeInstruments.slice(0, index),
        {
          ...initiativeInstruments[index],
          status: InstrumentStatus.ACTIVE
        },
        ...initiativeInstruments.slice(index + 1)
      ]
    };
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

  instruments = {
    ...instruments,
    [initiativeId]: [
      ...initiativeInstruments.slice(0, index),
      {
        ...initiativeInstruments[index],
        status: InstrumentStatus.PENDING_DEACTIVATION_REQUEST
      },
      ...initiativeInstruments.slice(index + 1)
    ]
  };

  setTimeout(() => {
    const initiativeInstruments = instruments[initiativeId] || [];

    const index = initiativeInstruments.findIndex(
      i => i.instrumentId === instrumentId
    );

    instruments = {
      ...instruments,
      [initiativeId]: [
        ...initiativeInstruments.slice(0, index),
        ...initiativeInstruments.slice(index + 1)
      ]
    };
  }, 5000);

  return true;
};

export const updateInitiative = (initiative: InitiativeDTO) =>
  (initiatives = { ...initiatives, [initiative.initiativeId]: initiative });

range(0, walletConfig.refundCount).forEach(() => {
  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
    status: InitiativeStatus.REFUNDABLE
  };

  const { initiativeId } = initiative;

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: [
      {
        instrumentId: ulid(),
        idWallet: pagoPaWallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.ACTIVE,
        instrumentType: InstrumentTypeEnum.CARD
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.PAID_REFUND
      }),
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.REJECTED_REFUND
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.REVERSAL,
        status: TransactionStatusEnum.AUTHORIZED
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.CANCELLED
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED,
        businessName: undefined
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED
      }),
      generateRandomIbanOperationDTO(),
      generateRandomRejectedInstrumentOperationDTO({
        operationType:
          RejectedInstrumentOperationTypeEnum.REJECTED_DELETE_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD
      }),
      generateRandomInstrumentOperationDTO({
        operationType: InstrumentOperationTypeEnum.DELETE_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD
      }),
      generateRandomInstrumentOperationDTO({
        operationType: InstrumentOperationTypeEnum.DELETE_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD,
        brand: undefined,
        maskedPan: undefined
      }),
      generateRandomRejectedInstrumentOperationDTO({
        operationType:
          RejectedInstrumentOperationTypeEnum.REJECTED_ADD_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD
      }),
      generateRandomInstrumentOperationDTO({
        operationType: InstrumentOperationTypeEnum.ADD_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD
      }),
      generateRandomInstrumentOperationDTO({
        operationType: InstrumentOperationTypeEnum.ADD_INSTRUMENT,
        instrumentType: InstrumentOperationInstrumentTypeEnum.CARD,
        brand: undefined,
        maskedPan: undefined
      }),
      generateRandomReadmittedOperationDTO(),
      generateRandomSuspendOperationDTO(),
      generateRandomOnboardingOperationDTO()
    ]
  };
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

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = { ...instruments, [initiativeId]: [] };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [generateRandomOnboardingOperationDTO()]
  };
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

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: [
      {
        instrumentId: ulid(),
        idWallet: pagoPaWallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.ACTIVE,
        instrumentType: InstrumentTypeEnum.CARD
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [generateRandomOnboardingOperationDTO()]
  };
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

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: [
      {
        instrumentId: ulid(),
        idWallet: pagoPaWallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.ACTIVE,
        instrumentType: InstrumentTypeEnum.CARD
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.PAID_REFUND
      }),
      generateRandomRefundOperationDTO({
        operationType: RefundOperationTypeEnum.REJECTED_REFUND
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.CANCELLED
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        businessName: undefined
      }),
      generateRandomTransactionOperationDTO(),
      generateRandomOnboardingOperationDTO()
    ]
  };
});

range(0, walletConfig.discountCount).forEach(() => {
  const initiativeName = `${faker.company.name()} [D]`;

  const initiative: InitiativeDTO = {
    ...generateRandomInitiativeDTO(),
    initiativeName,
    initiativeRewardType: InitiativeRewardTypeEnum.DISCOUNT,
    status: InitiativeStatus.REFUNDABLE,
    iban: undefined,
    nInstr: 0,
    accruedCents: 0,
    refundedCents: 0
  };

  const { initiativeId } = initiative;

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: [
      {
        instrumentId: ulid(),
        activationDate: new Date(),
        status: InstrumentStatus.ACTIVE,
        instrumentType: InstrumentTypeEnum.APP_IO_PAYMENT
      }
    ]
  };

  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED,
        brand: undefined
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        businessName: undefined,
        brand: undefined
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED,
        channel: TransactionChannelEnum.QRCODE,
        brand: undefined,
        businessName: undefined
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.AUTHORIZED,
        channel: TransactionChannelEnum.QRCODE,
        brand: undefined
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.REWARDED,
        channel: TransactionChannelEnum.QRCODE,
        brand: undefined
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.TRANSACTION,
        status: TransactionStatusEnum.CANCELLED,
        channel: TransactionChannelEnum.QRCODE,
        brand: undefined
      }),
      generateRandomTransactionOperationDTO({
        operationType: TransactionOperationTypeEnum.REVERSAL,
        status: TransactionStatusEnum.REWARDED,
        channel: TransactionChannelEnum.QRCODE,
        brand: undefined
      }),
      generateRandomInstrumentOperationDTO({
        operationType: InstrumentOperationTypeEnum.ADD_INSTRUMENT,
        instrumentType: OperationInstrumentTypeEnum.IDPAYCODE,
        brand: undefined
      }),
      generateRandomOnboardingOperationDTO()
    ]
  };
});

// eslint-disable-next-line functional/no-let
export let idPayCode: string | undefined;

export const generateIdPayCode = () => {
  idPayCode = faker.random.numeric(5);
};

export const enrollCodeToInitiative = (initiativeId: string): boolean => {
  const initiativeInstruments = instruments[initiativeId] || [];

  const isAlreadyEnrolled = initiativeInstruments.some(
    i => i.instrumentType === InstrumentTypeEnum.IDPAYCODE
  );

  if (isAlreadyEnrolled || idPayCode === undefined) {
    return false;
  }

  const instrumentId = ulid();

  instruments = {
    ...instruments,
    [initiativeId]: [
      ...initiativeInstruments,
      {
        instrumentId,
        activationDate: new Date(),
        status: InstrumentStatus.PENDING_ENROLLMENT_REQUEST,
        instrumentType: InstrumentTypeEnum.IDPAYCODE
      }
    ]
  };

  setTimeout(() => {
    const initiativeInstruments = instruments[initiativeId] || [];

    const index = initiativeInstruments.findIndex(
      i => i.instrumentId === instrumentId
    );

    instruments = {
      ...instruments,
      [initiativeId]: [
        ...initiativeInstruments.slice(0, index),
        {
          ...initiativeInstruments[index],
          status: InstrumentStatus.ACTIVE
        },
        ...initiativeInstruments.slice(index + 1)
      ]
    };
  }, 5000);

  return true;
};

// eslint-disable-next-line functional/no-let
let barcodeTransactions: {
  [initiativeID: string]: TransactionBarCodeResponse;
} = {};

export const getIdPayBarcodeTransaction = (
  initiativeId: string,
  trxExpirationSeconds: number = 60
): TransactionBarCodeResponse => {
  const currentBarcode = barcodeTransactions[initiativeId];
  if (currentBarcode === undefined) {
    const newBarcodeTransaction: TransactionBarCodeResponse = {
      id: ulid(),
      trxCode: faker.random.alphaNumeric(8),
      initiativeId,
      status: StatusEnum.CREATED,
      trxDate: new Date(),
      trxExpirationSeconds,
      initiativeName: faker.company.name(),
      residualBudgetCents: 100000
    };
    barcodeTransactions = {
      ...barcodeTransactions,
      [initiativeId]: newBarcodeTransaction
    };
    return newBarcodeTransaction;
  } else {
    const timeDiff = new Date().getTime() - currentBarcode.trxDate.getTime();
    // trxExpirationMinutes is in minutes, timeDiff is in milliseconds
    const isExpired = timeDiff > trxExpirationSeconds * 1000;
    if (isExpired) {
      // eslint-disable-next-line functional/immutable-data
      delete barcodeTransactions[initiativeId];
      return getIdPayBarcodeTransaction(initiativeId, trxExpirationSeconds);
    }
    return currentBarcode;
  }
};
