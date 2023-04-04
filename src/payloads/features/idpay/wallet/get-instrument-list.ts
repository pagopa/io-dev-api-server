import { InstrumentListDTO } from "../../../../../generated/definitions/idpay/InstrumentListDTO";
import { IDPayInitiativeID } from "../types";
import * as O from "fp-ts/lib/Option";
import { instrumentList } from "./data";

export const getInstrumentListResponse = (
  id: IDPayInitiativeID
): O.Option<InstrumentListDTO> => O.fromNullable(instrumentList[id]);
