import * as O from "fp-ts/lib/Option";
import { InitiativeDetailDTO } from "../../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { getInitiativeDetails } from "./data";

export const getInitiativeBeneficiaryDetailResponse = (
  initiativeId: string
): O.Option<InitiativeDetailDTO> =>
  O.fromNullable(getInitiativeDetails(initiativeId));
