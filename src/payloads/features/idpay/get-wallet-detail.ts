import * as O from "fp-ts/lib/Option";
import { InitiativeDTO } from "../../../../generated/definitions/idpay/InitiativeDTO";
import { initiatives, instruments } from "../../../persistence/idpay";

export const getWalletDetailResponse = (
  initiativeId: string
): O.Option<InitiativeDTO> =>
  O.fromNullable<InitiativeDTO>({
    ...initiatives[initiativeId],
    nInstr: instruments[initiativeId].length
  });
