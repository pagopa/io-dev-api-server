import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { initiatives, instruments } from "../../../persistence/idpay";
import { InitiativeDTO1 } from "../../../../generated/definitions/idpay/InitiativeDTO1";

export const getWalletDetailResponse = (
  initiativeId: string
): O.Option<InitiativeDTO1> =>
  pipe(
    O.fromNullable<InitiativeDTO1>(initiatives[initiativeId]),
    O.map(initiative => ({
      ...initiative,
      nInstr: instruments[initiativeId]?.length ?? 0
    }))
  );
