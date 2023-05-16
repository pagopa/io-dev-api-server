import * as O from "fp-ts/lib/Option";
import { IbanDTO } from "../../../../../generated/definitions/idpay/IbanDTO";
import { pipe } from "fp-ts/lib/function";
import { getIbanList } from "./data";

export const getIbanResponse = (input: string): O.Option<IbanDTO> =>
  pipe(
    getIbanList(),
    O.of,
    O.chain(ibanList =>
      O.fromNullable(ibanList.find(({ iban }) => iban === input))
    )
  );
