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

const pdndCriteria: ReadonlyArray<PDNDCriteriaDTO> = [
  {
    code: ulid(),
    authority: faker.random.words(1),
    description: "Data di nascita",
    value: faker.date
      .past(30)
      .getFullYear()
      .toString()
  },
  {
    code: ulid(),
    authority: faker.random.words(1),
    description: "Residenza",
    value: faker.address.country()
  }
];

const selfDeclarationMulti: ReadonlyArray<SelfDeclarationMultiDTO> = [
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description:
      "Testo dove viene descritto il criterio con opzioni di scelta multipla:",
    value: ["Criterio 1", "Criterio 2", "Criterio 3"]
  },
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description:
      "Testo dove viene descritto il criterio con opzioni di scelta multipla, seconda pagina:",
    value: ["Criterio 1", "Criterio 2", "Criterio 3"]
  }
];

const selfDeclarationBool: ReadonlyArray<SelfDeclarationBoolDTO> = [
  {
    _type: SelfDeclarationBoolType.boolean,
    code: ulid(),
    description: "Criterio 1",
    value: false
  },
  {
    _type: SelfDeclarationBoolType.boolean,
    code: ulid(),
    description: "Criterio 2",
    value: false
  },
  {
    _type: SelfDeclarationBoolType.boolean,
    code: ulid(),
    description: "Criterio 3",
    value: false
  }
];

const checkPrerequisitesResponseByInitiativeId: {
  [id: number]: RequiredCriteriaDTO;
} = {
  [IDPayInitiativeID.DEFAULT]: {
    pdndCriteria,
    selfDeclarationList: [...selfDeclarationMulti, ...selfDeclarationBool]
  },
  [IDPayInitiativeID.PDND_ONLY]: {
    pdndCriteria,
    selfDeclarationList: []
  },
  [IDPayInitiativeID.SELF_ONLY]: {
    pdndCriteria: [],
    selfDeclarationList: [...selfDeclarationMulti, ...selfDeclarationBool]
  }
};

const prerequisitesErrorByInitiativeId: {
  [id: number]: PrerequisitesErrorDTO;
} = {
  [IDPayInitiativeID.ERR_CHECK_BUDGET_TERMINATED]: {
    code: 403,
    message: "",
    details: DetailsEnum.BUDGET_TERMINATED
  },
  [IDPayInitiativeID.ERR_CHECK_ENDED]: {
    code: 403,
    message: "",
    details: DetailsEnum.INITIATIVE_END
  },
  [IDPayInitiativeID.ERR_CHECK_NOT_STARTED]: {
    code: 403,
    message: "",
    details: DetailsEnum.INITIATIVE_NOT_STARTED
  },
  [IDPayInitiativeID.ERR_CHECK_SUSPENDED]: {
    code: 403,
    message: "",
    details: DetailsEnum.INITIATIVE_SUSPENDED
  }
};

export const getCheckPrerequisitesResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<RequiredCriteriaDTO> =>
  O.fromNullable(checkPrerequisitesResponseByInitiativeId[id]);

export const getPrerequisitesErrorByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<PrerequisitesErrorDTO> =>
  O.fromNullable(prerequisitesErrorByInitiativeId[id]);
