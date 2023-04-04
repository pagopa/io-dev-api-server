import * as O from "fp-ts/lib/Option";
import { IbanDTO } from "../../../../../generated/definitions/idpay/IbanDTO";
import { ibanList } from "./data";

export const getIbanResponse = (input: string): O.Option<IbanDTO> =>
  O.fromNullable(ibanList.find(({ iban }) => iban === input));
