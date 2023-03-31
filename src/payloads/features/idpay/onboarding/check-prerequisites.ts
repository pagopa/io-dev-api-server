import faker from "faker/locale/it";
import { ulid } from "ulid";
import { PDNDCriteriaDTO } from "../../../../../generated/definitions/idpay/PDNDCriteriaDTO";
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
    description: faker.lorem.words(3),
    value: "A"
  },
  {
    code: ulid(),
    authority: faker.random.words(1),
    description: faker.lorem.words(3),
    value: "A"
  },
  {
    code: ulid(),
    authority: faker.random.words(1),
    description: faker.lorem.words(3),
    value: "A"
  }
];

const selfDeclarationMulti: ReadonlyArray<SelfDeclarationMultiDTO> = [
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description: "",
    value: ["A"]
  }
];

const selfDeclarationBool: ReadonlyArray<SelfDeclarationBoolDTO> = [
  {
    _type: SelfDeclarationBoolType.boolean,
    code: ulid(),
    description: "",
    value: false
  }
];

export const checkPrerequisitesResponseByInitiativeId: {
  [id: string]: RequiredCriteriaDTO;
} = {
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
