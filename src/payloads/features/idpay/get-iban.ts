import * as O from "fp-ts/lib/Option";
import { IbanDTO } from "../../../../generated/definitions/idpay/IbanDTO";
import { pipe } from "fp-ts/lib/function";
import { ibanList } from "../../../persistence/idpay";

export const getIbanResponse = (input: string): O.Option<IbanDTO> =>
  O.fromNullable(ibanList.find(({ iban }) => iban === input));
