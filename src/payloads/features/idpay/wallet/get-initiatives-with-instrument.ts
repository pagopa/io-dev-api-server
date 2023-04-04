import * as O from "fp-ts/lib/Option";
import { IDPayInitiativeID } from "../types";
import { InitiativeDetailDTO } from "../../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { initiativeDetailList } from "./data";
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
