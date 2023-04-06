import * as O from "fp-ts/lib/Option";
import { IDPayInitiativeID } from "../types";
import { InitiativeDetailDTO } from "../../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { initiativeDetailsList } from "./data";

export const getInitiativeBeneficiaryDetailResponse = (
  id: IDPayInitiativeID
): O.Option<InitiativeDetailDTO> => O.fromNullable(initiativeDetailsList[id]);
