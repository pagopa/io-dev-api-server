import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { InstrumentListDTO } from "../../../../../generated/definitions/idpay/InstrumentListDTO";
import { initiativesInstrumentList } from "./data";
import { InstrumentDTO } from "../../../../../generated/definitions/idpay/InstrumentDTO";

export const getInstrumentListResponse = (
  id: string
): O.Option<InstrumentListDTO> =>
  pipe(
    initiativesInstrumentList[id],
    O.fromNullable,
    O.alt(() => O.some([] as ReadonlyArray<InstrumentDTO>)),
    O.map(instrumentList => ({ instrumentList }))
  );
