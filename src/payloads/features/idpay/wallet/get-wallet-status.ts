import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { WalletStatusDTO } from "../../../../../generated/definitions/idpay/WalletStatusDTO";
import { getInitiative } from "./data";

export const getWalletStatusResponse = (
  id: string
): O.Option<WalletStatusDTO> =>
  pipe(
    getInitiative(id),
    O.fromNullable,
    O.map(({ status }) => ({ status }))
  );
