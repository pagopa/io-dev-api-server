import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { initiatives, instruments } from "../../../persistence/idpay";
import { InitiativeDTO } from "../../../../generated/definitions/idpay/InitiativeDTO";

export const getWalletDetailResponse = (
  initiativeId: string
): O.Option<InitiativeDTO> =>
  pipe(
    O.fromNullable<InitiativeDTO>(initiatives[initiativeId]),
    O.map(initiative => ({
      ...initiative,
      nInstr: instruments[initiativeId]?.length ?? 0
    }))
  );
