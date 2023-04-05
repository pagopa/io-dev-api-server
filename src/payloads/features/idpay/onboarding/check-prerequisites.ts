import * as O from "fp-ts/lib/Option";
import faker from "faker/locale/it";
import { ulid } from "ulid";
import { PDNDCriteriaDTO } from "../../../../../generated/definitions/idpay/PDNDCriteriaDTO";
import {
  PrerequisitesErrorDTO,
  DetailsEnum
} from "../../../../../generated/definitions/idpay/PrerequisitesErrorDTO";
import { RequiredCriteriaDTO } from "../../../../../generated/definitions/idpay/RequiredCriteriaDTO";
import {
  SelfDeclarationBoolDTO,
  _typeEnum as SelfDeclarationBoolType
} from "../../../../../generated/definitions/idpay/SelfDeclarationBoolDTO";
import {
  SelfDeclarationMultiDTO,
  _typeEnum as SelfDeclarationMultiType
} from "../../../../../generated/definitions/idpay/SelfDeclarationMultiDTO";
import { IDPayInitiativeID } from "../types";
import { checkPrerequisites, prerequisitesErrors } from "./data";

export const getCheckPrerequisitesResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<RequiredCriteriaDTO> => O.fromNullable(checkPrerequisites[id]);

export const getPrerequisitesErrorByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<PrerequisitesErrorDTO> => O.fromNullable(prerequisitesErrors[id]);
