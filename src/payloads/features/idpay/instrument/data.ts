import { faker } from "@faker-js/faker/locale/it";
import { ulid } from "ulid";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatus
} from "../../../../../generated/definitions/idpay/InstrumentDTO";
import { WalletV2 } from "../../../../../generated/definitions/pagopa/WalletV2";
import { pipe } from "fp-ts/lib/function";

const INSTRUMENT_STATUS_TIMEOUT = 5000;

export let initiativesInstrumentList: {
  [initiativeId: string]: ReadonlyArray<InstrumentDTO>;
} = {};

export const enrollInstrument = (
  initiativeId: string,
  wallet: WalletV2
): boolean => {
  const exists = initiativesInstrumentList[initiativeId]?.some(
    i => i.idWallet === wallet.idWallet?.toString()
  );

  if (exists) {
    return false;
  }

  initiativesInstrumentList[initiativeId] = [
    ...(initiativesInstrumentList[initiativeId] || []),
    {
      instrumentId: ulid(),
      idWallet: wallet.idWallet?.toString(),
      activationDate: new Date(),
      status: InstrumentStatus.PENDING_ENROLLMENT_REQUEST
    }
  ];

  setTimeout(() => {
    const index = initiativesInstrumentList[initiativeId].findIndex(
      i => i.idWallet === wallet.idWallet?.toString()
    );

    initiativesInstrumentList[initiativeId] = [
      ...initiativesInstrumentList[initiativeId].slice(0, index),
      {
        ...initiativesInstrumentList[initiativeId][index],
        status: InstrumentStatus.ACTIVE
      },
      ...initiativesInstrumentList[initiativeId].slice(index + 1)
    ];
  }, INSTRUMENT_STATUS_TIMEOUT);

  return true;
};

export const deleteInstrument = (
  initiativeId: string,
  instrumentId: string
): boolean => {
  const index = initiativesInstrumentList[initiativeId].findIndex(
    i => i.instrumentId === instrumentId
  );

  if (
    index < 0 ||
    initiativesInstrumentList[initiativeId][index].status !==
      InstrumentStatus.ACTIVE
  ) {
    return false;
  }

  initiativesInstrumentList[initiativeId] = [
    ...initiativesInstrumentList[initiativeId].slice(0, index),
    {
      ...initiativesInstrumentList[initiativeId][index],
      status: InstrumentStatus.PENDING_DEACTIVATION_REQUEST
    },
    ...initiativesInstrumentList[initiativeId].slice(index + 1)
  ];

  setTimeout(() => {
    const index = initiativesInstrumentList[initiativeId].findIndex(
      i => i.instrumentId === instrumentId
    );

    initiativesInstrumentList[initiativeId] = [
      ...initiativesInstrumentList[initiativeId].slice(0, index),
      ...initiativesInstrumentList[initiativeId].slice(index + 1)
    ];
  }, INSTRUMENT_STATUS_TIMEOUT);

  return true;
};
