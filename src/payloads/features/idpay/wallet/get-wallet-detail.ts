import * as O from "fp-ts/lib/Option";
import { InitiativeDTO } from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { initiatives } from "./data";

export const getWalletDetailResponse = (id: string): O.Option<InitiativeDTO> =>
  O.fromNullable(initiatives[id]);
