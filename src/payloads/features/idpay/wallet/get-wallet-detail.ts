import * as O from "fp-ts/lib/Option";
import { InitiativeDTO } from "../../../../../generated/definitions/idpay/InitiativeDTO";
import { IDPayInitiativeID } from "../types";
import { initiativeList } from "./data";

export const getWalletDetailResponse = (
  id: IDPayInitiativeID
): O.Option<InitiativeDTO> => O.fromNullable(initiativeList[id]);
