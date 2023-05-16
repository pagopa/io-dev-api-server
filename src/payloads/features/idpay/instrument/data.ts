import { ulid } from "ulid";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatus
} from "../../../../../generated/definitions/idpay/InstrumentDTO";
import { WalletV2 } from "../../../../../generated/definitions/pagopa/WalletV2";

const INSTRUMENT_STATUS_TIMEOUT = 5000;

type InstrumentsByInitiativeId = { [id: string]: ReadonlyArray<InstrumentDTO> };

let instruments: InstrumentsByInitiativeId = {};

export const getInstruments = (): InstrumentsByInitiativeId => instruments;

export const getInitiativeInstruments = (
  initiativeId: string
): ReadonlyArray<InstrumentDTO> => instruments[initiativeId];

export const addInstrumentToInitiative = (
  initiativeId: string,
  wallet: WalletV2
) => {
  instruments[initiativeId] = [
    ...(instruments[initiativeId] || []),
    {
      instrumentId: ulid(),
      idWallet: wallet.idWallet?.toString(),
      activationDate: new Date(),
      status: InstrumentStatus.ACTIVE
    }
  ];
};

export const enrollInstrument = (
  initiativeId: string,
  wallet: WalletV2
): boolean => {
  const isAlreadyEnrolled = instruments[initiativeId]?.some(
    i => i.idWallet === wallet.idWallet?.toString()
  );

  if (isAlreadyEnrolled) {
    return false;
  }

  instruments[initiativeId] = [
    ...(instruments[initiativeId] || []),
    {
      instrumentId: ulid(),
      idWallet: wallet.idWallet?.toString(),
      activationDate: new Date(),
      status: InstrumentStatus.PENDING_ENROLLMENT_REQUEST
    }
  ];

  setTimeout(() => {
    const index = instruments[initiativeId].findIndex(
      i => i.idWallet === wallet.idWallet?.toString()
    );

    instruments[initiativeId] = [
      ...instruments[initiativeId].slice(0, index),
      {
        ...instruments[initiativeId][index],
        status: InstrumentStatus.ACTIVE
      },
      ...instruments[initiativeId].slice(index + 1)
    ];
  }, INSTRUMENT_STATUS_TIMEOUT);

  return true;
};

export const removeInstrumentFromInitiative = (
  initiativeId: string,
  instrumentId: string
) => {
  const index = instruments[initiativeId].findIndex(
    i => i.instrumentId === instrumentId
  );

  instruments[initiativeId] = [
    ...instruments[initiativeId].slice(0, index),
    ...instruments[initiativeId].slice(index + 1)
  ];
};

export const deleteInstrument = (
  initiativeId: string,
  instrumentId: string
): boolean => {
  const index = instruments[initiativeId].findIndex(
    i => i.instrumentId === instrumentId
  );

  if (
    index < 0 ||
    instruments[initiativeId][index].status !== InstrumentStatus.ACTIVE
  ) {
    return false;
  }

  instruments[initiativeId] = [
    ...instruments[initiativeId].slice(0, index),
    {
      ...instruments[initiativeId][index],
      status: InstrumentStatus.PENDING_DEACTIVATION_REQUEST
    },
    ...instruments[initiativeId].slice(index + 1)
  ];

  setTimeout(() => {
    const index = instruments[initiativeId].findIndex(
      i => i.instrumentId === instrumentId
    );

    instruments[initiativeId] = [
      ...instruments[initiativeId].slice(0, index),
      ...instruments[initiativeId].slice(index + 1)
    ];
  }, INSTRUMENT_STATUS_TIMEOUT);

  return true;
};
