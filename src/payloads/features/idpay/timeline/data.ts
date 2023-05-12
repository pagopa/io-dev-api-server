import { faker } from "@faker-js/faker/locale/it";
import { ulid } from "ulid";
import {
  IbanOperationDTO,
  OperationTypeEnum as IbanOperationEnum
} from "../../../../../generated/definitions/idpay/IbanOperationDTO";
import {
  InstrumentOperationDTO,
  OperationTypeEnum as InstrumentOperationEnum
} from "../../../../../generated/definitions/idpay/InstrumentOperationDTO";
import {
  OnboardingOperationDTO,
  OperationTypeEnum as OnboardingOperationEnum
} from "../../../../../generated/definitions/idpay/OnboardingOperationDTO";
import { OperationDTO } from "../../../../../generated/definitions/idpay/OperationDTO";
import { OperationListDTO } from "../../../../../generated/definitions/idpay/OperationListDTO";
import {
  RefundOperationDTO,
  OperationTypeEnum as RefundOperationEnum
} from "../../../../../generated/definitions/idpay/RefundOperationDTO";
import {
  RejectedInstrumentOperationDTO,
  OperationTypeEnum as RejectedInstrumentOperationEnum
} from "../../../../../generated/definitions/idpay/RejectedInstrumentOperationDTO";
import {
  TransactionDetailDTO,
  OperationTypeEnum as TransactionDetailEnum
} from "../../../../../generated/definitions/idpay/TransactionDetailDTO";
import {
  TransactionOperationDTO,
  OperationTypeEnum as TransactionOperationEnum
} from "../../../../../generated/definitions/idpay/TransactionOperationDTO";
import { CardInfo } from "../../../../../generated/definitions/pagopa/CardInfo";
import { WalletV2 } from "../../../../../generated/definitions/pagopa/WalletV2";
import { getWalletV2 } from "../../../../routers/walletsV2";
import { ibanList } from "../iban/data";
import { IDPayInitiativeID as InitiativeId } from "../types";
import { RefundDetailDTO } from "../../../../../generated/definitions/idpay/RefundDetailDTO";

const wallet: WalletV2 = getWalletV2()[0];
const walletInfo: CardInfo = wallet.info as CardInfo;

const rejectedRefund: RefundOperationDTO = {
  operationType: RefundOperationEnum.REJECTED_REFUND,
  operationDate: new Date(),
  operationId: ulid(),
  eventId: ulid(),
  amount: 10
};

const rejectedRefundDetail: RefundDetailDTO = {
  ...rejectedRefund,
  cro: ulid(),
  iban: faker.finance.iban(false, "IT"),
  startDate: faker.date.recent(),
  endDate: faker.date.recent(),
  transferDate: faker.date.recent()
};

const paidRefund: RefundOperationDTO = {
  operationType: RefundOperationEnum.PAID_REFUND,
  operationDate: new Date(),
  operationId: ulid(),
  eventId: ulid(),
  amount: 10
};

const paidRefundDetail: RefundDetailDTO = {
  ...paidRefund,
  cro: ulid(),
  iban: faker.finance.iban(false, "IT"),
  startDate: faker.date.recent(),
  endDate: faker.date.recent(),
  transferDate: faker.date.recent()
};

const reversal: TransactionOperationDTO = {
  operationType: TransactionOperationEnum.REVERSAL,
  operationDate: new Date(),
  operationId: ulid(),
  accrued: 10,
  amount: 100,
  brand: walletInfo.brand || "VISA",
  circuitType: "01",
  brandLogo: walletInfo.brandLogo || "",
  maskedPan: walletInfo.blurredNumber || "0000"
};

const reversalDetail: TransactionDetailDTO = {
  ...reversal,
  operationType: TransactionDetailEnum.REVERSAL,
  idTrxAcquirer: ulid(),
  idTrxIssuer: ulid()
};

const transaction: TransactionOperationDTO = {
  operationType: TransactionOperationEnum.TRANSACTION,
  operationDate: new Date(),
  operationId: ulid(),
  accrued: 10,
  amount: 100,
  brand: walletInfo.brand || "VISA",
  circuitType: "01",
  brandLogo: walletInfo.brandLogo || "",
  maskedPan: walletInfo.blurredNumber || "0000"
};

const transactionDetail: TransactionDetailDTO = {
  ...transaction,
  operationType: TransactionDetailEnum.TRANSACTION,
  idTrxAcquirer: ulid(),
  idTrxIssuer: ulid()
};

const rejectedDeleteInstrument: RejectedInstrumentOperationDTO = {
  operationType: RejectedInstrumentOperationEnum.REJECTED_DELETE_INSTRUMENT,
  operationDate: new Date(),
  operationId: ulid(),
  brand: walletInfo.brand || "VISA",
  brandLogo: walletInfo.brandLogo || "",
  channel: faker.datatype.string(),
  maskedPan: walletInfo.blurredNumber || "0000"
};

const rejectedAddInstrument: RejectedInstrumentOperationDTO = {
  operationType: RejectedInstrumentOperationEnum.REJECTED_ADD_INSTRUMENT,
  operationDate: new Date(),
  operationId: ulid(),
  brand: walletInfo.brand || "VISA",
  brandLogo: walletInfo.brandLogo || "",
  channel: faker.datatype.string(),
  maskedPan: walletInfo.blurredNumber || "0000"
};

const addIban: IbanOperationDTO = {
  operationType: IbanOperationEnum.ADD_IBAN,
  operationDate: new Date(),
  operationId: ulid(),
  channel: "",
  iban: ibanList[0]?.iban || ""
};

const deleteInstrument: InstrumentOperationDTO = {
  operationType: InstrumentOperationEnum.DELETE_INSTRUMENT,
  operationDate: new Date(),
  operationId: ulid(),
  brand: walletInfo.brand || "VISA",
  brandLogo: walletInfo.brandLogo || "",
  channel: faker.datatype.string(),
  maskedPan: walletInfo.blurredNumber || "0000"
};

const addInstrument: InstrumentOperationDTO = {
  operationType: InstrumentOperationEnum.ADD_INSTRUMENT,
  operationDate: new Date(),
  operationId: ulid(),
  brand: walletInfo.brand || "VISA",
  brandLogo: walletInfo.brandLogo || "",
  channel: faker.datatype.string(),
  maskedPan: walletInfo.blurredNumber || "0000"
};

const onboarding: OnboardingOperationDTO = {
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

export const generateInitiativeTimeline = (
  initiativeId: string,
  fullTimeline: boolean = true
) => {
  initiativeTimeline[initiativeId] = [
    ...(fullTimeline
      ? [
          rejectedRefund,
          paidRefund,
          reversal,
          transaction,
          rejectedDeleteInstrument,
          rejectedAddInstrument,
          addIban,
          deleteInstrument,
          addInstrument
        ]
      : []),
    onboarding
  ];

  initiativeTimelineDetails[initiativeId] = [
    ...(fullTimeline
      ? [
          rejectedRefundDetail,
          paidRefundDetail,
          reversalDetail,
          transactionDetail,
          addIban,
          deleteInstrument,
          addInstrument
        ]
      : []),
    onboarding
  ];
};
