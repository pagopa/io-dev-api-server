import * as O from "fp-ts/lib/Option";
import { InitiativeDTO } from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { getInitiative } from "./data";

export const getWalletDetailResponse = (id: string): O.Option<InitiativeDTO> =>
  O.fromNullable(getInitiative(id));
