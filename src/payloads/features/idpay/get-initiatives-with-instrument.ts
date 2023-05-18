import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  StatusEnum as InitiativeStatusEnum,
  InitiativesStatusDTO
} from "../../../../generated/definitions/idpay/InitiativesStatusDTO";
import { InitiativesWithInstrumentDTO } from "../../../../generated/definitions/idpay/InitiativesWithInstrumentDTO";
import { CardInfo } from "../../../../generated/definitions/pagopa/walletv2/CardInfo";
import { getWalletV2 } from "../../../routers/walletsV2";
import { WalletV2 } from "../../../../generated/definitions/pagopa/WalletV2";

import { instruments, initiatives } from "../../../persistence/idpay";

const initiativesByWalletId = (
  idWallet: string
): ReadonlyArray<InitiativesStatusDTO> => {
  const result: { [id: string]: ReadonlyArray<InitiativesStatusDTO> } = {};

  Object.entries(instruments).forEach(([id, instruments]) => {
    instruments.forEach(instrument => {
      const walletId = instrument.idWallet || "";

      if (walletId === idWallet) {
        const status: InitiativesStatusDTO = {
          initiativeId: id,
          initiativeName: initiatives[id].initiativeName || "",
          status: instrument.status || InitiativeStatusEnum.INACTIVE,
          idInstrument: instrument.instrumentId
        };

        if (!result[idWallet]) {
          result[idWallet] = [];
        }
        result[idWallet] = [...result[idWallet], status];
      }
    });
  });

  return result[idWallet] || [];
};

const getWalletById = (id: number): O.Option<WalletV2> =>
  O.fromNullable(getWalletV2().find(w => w.idWallet === id));

export const getInitiativeWithInstrumentResponse = (
  idWallet: string
): O.Option<InitiativesWithInstrumentDTO> =>
  pipe(
    idWallet,
    O.some,
    O.map(parseInt),
    O.chain(getWalletById),
    O.chain(wallet =>
      pipe(
        idWallet,
        O.some,
        O.map(initiativesByWalletId),
        O.map(initiativeList => {
          const info = wallet.info as CardInfo;
          return {
            idWallet,
            maskedPan: info.blurredNumber || "",
            brand: info.brand || "",
            initiativeList
          };
        })
      )
    )
  );
