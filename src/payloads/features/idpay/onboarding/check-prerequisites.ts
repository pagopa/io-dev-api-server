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

export const getCheckPrerequisitesResponseByInitiativeId = (
  id: IDPayInitiativeID
) => {
  switch (id) {
    case IDPayInitiativeID.DEFAULT:
      return O.some({
        pdndCriteria,
        selfDeclarationList: [...selfDeclarationMulti, ...selfDeclarationBool]
      });
    case IDPayInitiativeID.PDND_ONLY:
      O.some({
        pdndCriteria,
        selfDeclarationList: []
      });
    case IDPayInitiativeID.SELF_ONLY:
      return O.some({
        pdndCriteria: [],
        selfDeclarationList: [...selfDeclarationMulti, ...selfDeclarationBool]
      });
    default:
      return O.none;
  }
};

export const getPrerequisitesErrorByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<PrerequisitesErrorDTO> => {
  switch (id) {
    case IDPayInitiativeID.ERR_CHECK_BUDGET_TERMINATED:
      return O.some({
        code: 403,
        message: "",
        details: DetailsEnum.BUDGET_TERMINATED
      });
    case IDPayInitiativeID.ERR_CHECK_ENDED:
      return O.some({
        code: 403,
        message: "",
        details: DetailsEnum.INITIATIVE_END
      });
    case IDPayInitiativeID.ERR_CHECK_NOT_STARTED:
      return O.some({
        code: 403,
        message: "",
        details: DetailsEnum.INITIATIVE_NOT_STARTED
      });
    case IDPayInitiativeID.ERR_CHECK_SUSPENDED:
      return O.some({
        code: 403,
        message: "",
        details: DetailsEnum.INITIATIVE_SUSPENDED
      });
    default:
      return O.none;
  }
};
