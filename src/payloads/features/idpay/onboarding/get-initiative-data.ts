import * as O from "fp-ts/lib/Option";
import { InitiativeDataDTO } from "../../../../../generated/definitions/idpay/InitiativeDataDTO";
import { IDPayServiceID } from "./types";
import { initiativeData } from "./data";

export const getInitiativeDataResponseByServiceId = (
  id: IDPayServiceID
): O.Option<InitiativeDataDTO> => O.fromNullable(initiativeData[id]);
