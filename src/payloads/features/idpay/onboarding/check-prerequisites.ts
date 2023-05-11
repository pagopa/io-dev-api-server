import * as O from "fp-ts/lib/Option";
import { PrerequisitesErrorDTO } from "../../../../../generated/definitions/idpay/PrerequisitesErrorDTO";
import { RequiredCriteriaDTO } from "../../../../../generated/definitions/idpay/RequiredCriteriaDTO";
import { IDPayInitiativeID } from "../types";
import { checkPrerequisites, prerequisitesErrors } from "./data";

export const getCheckPrerequisitesResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<RequiredCriteriaDTO> => O.fromNullable(checkPrerequisites[id]);

export const getPrerequisitesErrorByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<PrerequisitesErrorDTO> => O.fromNullable(prerequisitesErrors[id]);
