import { faker } from "@faker-js/faker/locale/it";
import { range } from "lodash";
import { ulid } from "ulid";
import { IbanDTO } from "../../generated/definitions/idpay/IbanDTO";
import { OperationTypeEnum as IbanOperationEnum } from "../../generated/definitions/idpay/IbanOperationDTO";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum as InitiativeStatus
} from "../../generated/definitions/idpay/InitiativeDTO";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatus
} from "../../generated/definitions/idpay/InstrumentDTO";
import { OperationTypeEnum as InstrumentOperationEnum } from "../../generated/definitions/idpay/InstrumentOperationDTO";
import { OperationTypeEnum as OnboardingOperationEnum } from "../../generated/definitions/idpay/OnboardingOperationDTO";
import { OperationListDTO } from "../../generated/definitions/idpay/OperationListDTO";
import { OperationTypeEnum as RefundOperationEnum } from "../../generated/definitions/idpay/RefundOperationDTO";
import { OperationTypeEnum as RejectedInstrumentOperationEnum } from "../../generated/definitions/idpay/RejectedInstrumentOperationDTO";
import { ChannelEnum as TransactionChannelEnum, OperationTypeEnum as TransactionOperationEnum, StatusEnum as TransactionStatusEnum } from "../../generated/definitions/idpay/TransactionOperationDTO";
import { CardInfo } from "../../generated/definitions/pagopa/CardInfo";
import { WalletV2 } from "../../generated/definitions/pagopa/WalletV2";
import { ioDevServerConfig } from "../config";
import { getRandomEnumValue } from "../payloads/utils/random";
import { getWalletV2 } from "../routers/walletsV2";

const idPayConfig = ioDevServerConfig.features.idpay;
const { idPay: walletConfig } = ioDevServerConfig.wallet;

const pagoPaWallet: WalletV2 = getWalletV2()[0];
const pagoPaWalletInfo: CardInfo = pagoPaWallet.info as CardInfo;

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

const generateRandomIbanDTO = (): IbanDTO => ({
  iban: faker.finance.iban(false, "IT"),
  checkIbanStatus: faker.datatype.string(),
  holderBank: faker.company.name(),
  description: faker.company.bs(),
  channel: faker.datatype.string()
});

const generateRandomOperationDTO = (
  type: OperationListDTO["operationType"]
): OperationListDTO => {
  switch (type) {
    case "PAID_REFUND":
    case "REJECTED_REFUND":
      return {
        operationType: type,
        operationDate: new Date(),
        operationId: ulid(),
        eventId: ulid(),
        amount: faker.datatype.number({ min: 5, max: 100 })
      };
    case "REVERSAL":
    case "TRANSACTION":
      return {
        operationType: type,
        operationDate: new Date(),
        operationId: ulid(),
        accrued: faker.datatype.number({ min: 5, max: 25 }),
        amount: faker.datatype.number({ min: 50, max: 100 }),
        brand: pagoPaWalletInfo.brand || "VISA",
        circuitType: "01",
        brandLogo: pagoPaWalletInfo.brandLogo || "",
        maskedPan: pagoPaWalletInfo.blurredNumber || "0000",
        status: getRandomEnumValue(TransactionStatusEnum),
      };
    case "ADD_IBAN":
      return {
        operationType: IbanOperationEnum.ADD_IBAN,
        operationDate: new Date(),
        operationId: ulid(),
        channel: faker.datatype.string(),
        iban: faker.helpers.arrayElement(ibanList)?.iban || ""
      };
    case "ADD_INSTRUMENT":
    case "REJECTED_ADD_INSTRUMENT":
    case "DELETE_INSTRUMENT":
    case "REJECTED_DELETE_INSTRUMENT":
      return {
        operationType: type,
        operationDate: new Date(),
        operationId: ulid(),
        brand: pagoPaWalletInfo.brand || "VISA",
        brandLogo: pagoPaWalletInfo.brandLogo || "",
        channel: faker.datatype.string(),
        maskedPan: pagoPaWalletInfo.blurredNumber || "0000"
      };
    case "ONBOARDING":
    default:
      return {
        operationType: OnboardingOperationEnum.ONBOARDING,
        operationDate: new Date(),
        operationId: ulid()
      };
  }
};

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

  instruments = {
    ...instruments,
    [initiativeId]: [
      ...initiativeInstruments,
      {
        instrumentId: ulid(),
        idWallet: wallet.idWallet?.toString(),
        activationDate: new Date(),
        status: InstrumentStatus.PENDING_ENROLLMENT_REQUEST
      }
    ]
  };

  setTimeout(() => {
    const initiativeInstruments = instruments[initiativeId] || [];

    const index = initiativeInstruments.findIndex(
      i => i.idWallet === wallet.idWallet?.toString()
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
        status: InstrumentStatus.ACTIVE
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomOperationDTO(RefundOperationEnum.REJECTED_REFUND),
      generateRandomOperationDTO(RefundOperationEnum.PAID_REFUND),
      generateRandomOperationDTO(TransactionOperationEnum.REVERSAL),
      generateRandomOperationDTO(TransactionOperationEnum.TRANSACTION),
      generateRandomOperationDTO(
        RejectedInstrumentOperationEnum.REJECTED_DELETE_INSTRUMENT
      ),
      generateRandomOperationDTO(
        RejectedInstrumentOperationEnum.REJECTED_ADD_INSTRUMENT
      ),
      generateRandomOperationDTO(IbanOperationEnum.ADD_IBAN),
      generateRandomOperationDTO(InstrumentOperationEnum.DELETE_INSTRUMENT),
      generateRandomOperationDTO(InstrumentOperationEnum.ADD_INSTRUMENT),
      generateRandomOperationDTO(OnboardingOperationEnum.ONBOARDING)
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
    [initiativeId]: [
      generateRandomOperationDTO(OnboardingOperationEnum.ONBOARDING)
    ]
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
        status: InstrumentStatus.ACTIVE
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomOperationDTO(RefundOperationEnum.REJECTED_REFUND),
      generateRandomOperationDTO(RefundOperationEnum.PAID_REFUND),
      generateRandomOperationDTO(TransactionOperationEnum.REVERSAL),
      generateRandomOperationDTO(TransactionOperationEnum.TRANSACTION),
      generateRandomOperationDTO(
        RejectedInstrumentOperationEnum.REJECTED_DELETE_INSTRUMENT
      ),
      generateRandomOperationDTO(
        RejectedInstrumentOperationEnum.REJECTED_ADD_INSTRUMENT
      ),
      generateRandomOperationDTO(IbanOperationEnum.ADD_IBAN),
      generateRandomOperationDTO(InstrumentOperationEnum.DELETE_INSTRUMENT),
      generateRandomOperationDTO(InstrumentOperationEnum.ADD_INSTRUMENT),
      generateRandomOperationDTO(OnboardingOperationEnum.ONBOARDING)
    ]
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
        status: InstrumentStatus.ACTIVE
      }
    ]
  };
  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      generateRandomOperationDTO(RefundOperationEnum.REJECTED_REFUND),
      generateRandomOperationDTO(RefundOperationEnum.PAID_REFUND),
      generateRandomOperationDTO(TransactionOperationEnum.REVERSAL),
      generateRandomOperationDTO(TransactionOperationEnum.TRANSACTION),
      generateRandomOperationDTO(
        RejectedInstrumentOperationEnum.REJECTED_DELETE_INSTRUMENT
      ),
      generateRandomOperationDTO(
        RejectedInstrumentOperationEnum.REJECTED_ADD_INSTRUMENT
      ),
      generateRandomOperationDTO(IbanOperationEnum.ADD_IBAN),
      generateRandomOperationDTO(InstrumentOperationEnum.DELETE_INSTRUMENT),
      generateRandomOperationDTO(InstrumentOperationEnum.ADD_INSTRUMENT),
      generateRandomOperationDTO(OnboardingOperationEnum.ONBOARDING)
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
    accrued: 0,
    refunded: 0
  };

  const { initiativeId } = initiative;

  initiatives = { ...initiatives, [initiativeId]: initiative };
  instruments = {
    ...instruments,
    [initiativeId]: []
  };

  initiativeTimeline = {
    ...initiativeTimeline,
    [initiativeId]: [
      {
        ...generateRandomOperationDTO(TransactionOperationEnum.TRANSACTION),
        status: TransactionStatusEnum.AUTHORIZED,
        channel: TransactionChannelEnum.RTD
      } as OperationListDTO,
      {
        ...generateRandomOperationDTO(TransactionOperationEnum.TRANSACTION),
        status: TransactionStatusEnum.REWARDED,
        channel: TransactionChannelEnum.RTD
      } as OperationListDTO,
      {
        ...generateRandomOperationDTO(TransactionOperationEnum.TRANSACTION),
        status: TransactionStatusEnum.CANCELED,
        channel: TransactionChannelEnum.RTD
      } as OperationListDTO,
      {
        ...generateRandomOperationDTO(TransactionOperationEnum.TRANSACTION),
        status: TransactionStatusEnum.AUTHORIZED,
        channel: TransactionChannelEnum.QRCODE
      } as OperationListDTO,
      {
        ...generateRandomOperationDTO(TransactionOperationEnum.TRANSACTION),
        status: TransactionStatusEnum.REWARDED,
        channel: TransactionChannelEnum.QRCODE
      } as OperationListDTO,
      {
        ...generateRandomOperationDTO(TransactionOperationEnum.TRANSACTION),
        status: TransactionStatusEnum.CANCELED,
        channel: TransactionChannelEnum.QRCODE
      } as OperationListDTO,
      generateRandomOperationDTO(OnboardingOperationEnum.ONBOARDING)
    ]
  };
});
