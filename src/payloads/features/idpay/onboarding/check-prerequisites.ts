import faker from "faker/locale/it";
import { ulid } from "ulid";
import { PDNDCriteriaDTO } from "../../../../../generated/definitions/idpay/PDNDCriteriaDTO";
import {
  PrerequisitesErrorDTO,
  DetailsEnum as PrerequisitesErrorDetailsEnum
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
import { IDPayInitiativeID } from "./ids";

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

export const checkPrerequisitesResponseByInitiativeId: {
  [id: string]: RequiredCriteriaDTO;
} = {
  [IDPayInitiativeID.OK]: {
    pdndCriteria,
    selfDeclarationList: [...selfDeclarationMulti, ...selfDeclarationBool]
  },
  [IDPayInitiativeID.OK_INVITED]: {
    pdndCriteria,
    selfDeclarationList: []
  },
  [IDPayInitiativeID.OK_NO_PREREQUISITES]: {
    pdndCriteria: [],
    selfDeclarationList: []
  },
  [IDPayInitiativeID.OK_PDND_ONLY]: {
    pdndCriteria,
    selfDeclarationList: []
  },
  [IDPayInitiativeID.OK_SELF_ONLY]: {
    pdndCriteria: [],
    selfDeclarationList: [...selfDeclarationMulti, ...selfDeclarationBool]
  },
  [IDPayInitiativeID.OK_SELF_MULTI_ONLY]: {
    pdndCriteria: [],
    selfDeclarationList: selfDeclarationMulti
  },
  [IDPayInitiativeID.OK_SELF_BOOL_ONLY]: {
    pdndCriteria: [],
    selfDeclarationList: selfDeclarationBool
  }
};

export const prerequisitesErrorByInitiativeId: {
  [id: string]: PrerequisitesErrorDetailsEnum;
} = {
  [IDPayInitiativeID.ERR_BUDGET_TERMINATED]:
    PrerequisitesErrorDetailsEnum.BUDGET_TERMINATED,
  [IDPayInitiativeID.ERR_ENDED]: PrerequisitesErrorDetailsEnum.INITIATIVE_END,
  [IDPayInitiativeID.ERR_NOT_STARTED]:
    PrerequisitesErrorDetailsEnum.INITIATIVE_NOT_STARTED,
  [IDPayInitiativeID.ERR_SUSPENDED]:
    PrerequisitesErrorDetailsEnum.INITIATIVE_SUSPENDED
};

export const getPrerequisitesErrorDTO = (
  details: PrerequisitesErrorDetailsEnum
): PrerequisitesErrorDTO => ({ code: 403, message: "", details });
