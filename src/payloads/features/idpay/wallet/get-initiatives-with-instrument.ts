import * as O from "fp-ts/lib/Option";
import { InitiativesWithInstrumentDTO } from "../../../../../generated/definitions/idpay/InitiativesWithInstrumentDTO";

export const getInitiativeWithInstrumentResponse = (
  walletId: string
): O.Option<InitiativesWithInstrumentDTO> =>
  O.fromNullable({
    brand: "",
    idWallet: "",
    initiativeList: [],
    maskedPan: ""
  });
