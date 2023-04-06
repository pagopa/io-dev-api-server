import * as O from "fp-ts/lib/Option";
import { WalletStatusDTO } from "../../../../../generated/definitions/idpay/WalletStatusDTO";
import { IDPayInitiativeID } from "../types";
import { initiativeList } from "./data";

export const getWalletStatusResponse = (
  id: IDPayInitiativeID
): O.Option<WalletStatusDTO> =>
  O.fromNullable({ status: initiativeList[id].status });
