import * as O from "fp-ts/lib/Option";
import { WalletStatusDTO } from "../../../../../generated/definitions/idpay/WalletStatusDTO";
import { initiatives } from "./data";
import { pipe } from "fp-ts/lib/function";

export const getWalletStatusResponse = (
  id: string
): O.Option<WalletStatusDTO> =>
  pipe(
    initiatives[id],
    O.fromNullable,
    O.map(({ status }) => ({ status }))
  );
