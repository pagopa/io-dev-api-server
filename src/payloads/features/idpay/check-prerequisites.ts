import * as O from "fp-ts/lib/Option";
import { faker } from "@faker-js/faker/locale/it";
import { ulid } from "ulid";
import {
  AuthorityEnum,
  CodeEnum,
  OperatorEnum,
  PDNDCriteriaDTO
} from "../../../../generated/definitions/idpay/PDNDCriteriaDTO";
import {
  PrerequisitesErrorDTO,
  DetailsEnum
} from "../../../../generated/definitions/idpay/PrerequisitesErrorDTO";
import { RequiredCriteriaDTO } from "../../../../generated/definitions/idpay/RequiredCriteriaDTO";
import {
  SelfDeclarationBoolDTO,
  _typeEnum as SelfDeclarationBoolType
} from "../../../../generated/definitions/idpay/SelfDeclarationBoolDTO";
import {
  SelfDeclarationMultiDTO,
  _typeEnum as SelfDeclarationMultiType
} from "../../../../generated/definitions/idpay/SelfDeclarationMultiDTO";
import { IDPayInitiativeID } from "./types";
import { getRandomEnumValue } from "../../utils/random";

const pdndCriteria: ReadonlyArray<PDNDCriteriaDTO> = [
  {
    code: CodeEnum.BIRTHDATE,
    authority: AuthorityEnum.INPS,
    description: "Data di nascita",
    operator: getRandomEnumValue(OperatorEnum),
    value: faker.date
      .between("1990-01-01", "1999-12-31")
      .getFullYear()
      .toString(),
    value2: faker.date
      .between("1990-01-01", "2023-12-31")
      .getFullYear()
      .toString()
  },
  {
    code: CodeEnum.ISEE,
    authority: AuthorityEnum.AGID,
    description: "ISEE",
    operator: getRandomEnumValue(OperatorEnum),
    value: faker.finance.amount(10000, 100000),
    value2: faker.finance.amount(10000, 100000)
  },
  {
    code: CodeEnum.RESIDENCE,
    authority: AuthorityEnum.AGID,
    description: "Residenza",
    operator: [OperatorEnum.EQ, OperatorEnum.NOT_EQ][faker.datatype.number(1)],
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

const checkPrerequisites: {
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

const prerequisitesErrors: {
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
): O.Option<RequiredCriteriaDTO> => O.fromNullable(checkPrerequisites[id]);

export const getPrerequisitesErrorByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<PrerequisitesErrorDTO> => O.fromNullable(prerequisitesErrors[id]);
