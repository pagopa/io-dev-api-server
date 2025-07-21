import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";
import {
  CodeEnum as OnboardingErrorCodeEnum,
  OnboardingErrorDTO
} from "../../../../generated/definitions/idpay/OnboardingErrorDTO";
import {
  AuthorityEnum,
  CodeEnum,
  OperatorEnum,
  PDNDCriteriaDTO
} from "../../../../generated/definitions/idpay/PDNDCriteriaDTO";
import { RequiredCriteriaDTO } from "../../../../generated/definitions/idpay/RequiredCriteriaDTO";
import {
  SelfDeclarationBoolDTO,
  _typeEnum as SelfDeclarationBoolType
} from "../../../../generated/definitions/idpay/SelfDeclarationBoolDTO";
import {
  SelfDeclarationMultiDTO,
  _typeEnum as SelfDeclarationMultiType
} from "../../../../generated/definitions/idpay/SelfDeclarationMultiDTO";
import { _typeEnum as SelfDeclarationTextDTO } from "../../../../generated/definitions/idpay/SelfDeclarationTextDTO";
import { getRandomEnumValue } from "../../utils/random";
import { IDPayInitiativeID } from "./types";

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

const criterionArray = ["Criterio 1", "Criterio 2", "Criterio 3"];
const selfDeclarationMulti: ReadonlyArray<SelfDeclarationMultiDTO> = [
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description:
      "Testo dove viene descritto il criterio con opzioni di scelta multipla:",
    value: criterionArray
  },
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description:
      "Testo dove viene descritto il criterio con opzioni di scelta multipla, seconda pagina:",
    value: criterionArray
  }
];

const guidoniaSelfDeclarationMulti: ReadonlyArray<SelfDeclarationMultiDTO> = [
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description: "Costituire una famiglia monogenitoriale:",
    value: ["Sì", "No"]
  }
];

const selfDeclarationBool: ReadonlyArray<SelfDeclarationBoolDTO> = [
  {
    _type: SelfDeclarationBoolType.boolean,
    code: ulid(),
    description: criterionArray[0],
    value: false
  },
  {
    _type: SelfDeclarationBoolType.boolean,
    code: ulid(),
    description: criterionArray[1],
    value: false
  },
  {
    _type: SelfDeclarationBoolType.boolean,
    code: ulid(),
    description: criterionArray[2],
    value: false
  }
];

const checkPrerequisites: {
  [id: number]: RequiredCriteriaDTO;
} = {
  [IDPayInitiativeID.OK]: {
    pdndCriteria,
    selfDeclarationList: [...selfDeclarationMulti, ...selfDeclarationBool]
  },
  [IDPayInitiativeID.OK_GUIDONIA]: {
    pdndCriteria,
    selfDeclarationList: [
      ...guidoniaSelfDeclarationMulti,
      {
        _type: SelfDeclarationTextDTO.text,
        code: ulid(),
        description:
          "Avere un ISEE valido al 31\\12\\2024 con un valore pari a:",
        value: "valore ISEE"
      },
      {
        _type: SelfDeclarationTextDTO.text,
        code: ulid(),
        description:
          "Aver già presentato una Dichiarazione Sostitutive Unica (DSU) con numero di protocollo:",
        value: "Numero di protocollo DSU"
      },
      {
        _type: SelfDeclarationTextDTO.text,
        code: ulid(),
        description: "Voler ricevere il rimborso al seguente IBAN:",
        value: "IBAN"
      }
    ]
  },
  [IDPayInitiativeID.OK_PDND_ONLY]: {
    pdndCriteria,
    selfDeclarationList: []
  },
  [IDPayInitiativeID.OK_SELF_ONLY]: {
    pdndCriteria: [],
    selfDeclarationList: [...selfDeclarationMulti, ...selfDeclarationBool]
  },
  [IDPayInitiativeID.BONUS_ELETTRODOMESTICI]: {
    pdndCriteria,
    selfDeclarationList: [
      {
        _type: SelfDeclarationMultiType.multi,
        code: ulid(),
        description:
          "Se dichiari di avere un ISEE inferiore a 25.000€, verificheremo l’informazione con INPS",
        value: [
          "Sì, inferiore a 25.000€",
          "Sì, uguale o superiore a 25.000€",
          "No, non ho un ISEE "
        ]
      },
      {
        _type: SelfDeclarationBoolType.boolean,
        code: ulid(),
        description:
          "Userò il bonus per l'acquisto di un elettrodomestico di classe energetica superiore destinato a sostituire un altro della stessa tipologia",
        value: false
      }
    ]
  }
};

const prerequisitesErrors: {
  [id: number]: OnboardingErrorDTO;
} = {
  [IDPayInitiativeID.KO_GENERIC]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_GENERIC_ERROR,
    message: ""
  },
  [IDPayInitiativeID.KO_NOT_STARTED]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_INITIATIVE_NOT_STARTED,
    message: ""
  },
  [IDPayInitiativeID.KO_ENDED]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_INITIATIVE_ENDED,
    message: ""
  },
  [IDPayInitiativeID.KO_BUDGET_EXHAUSTED]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_BUDGET_EXHAUSTED,
    message: ""
  }
};

export const getCheckPrerequisitesResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<RequiredCriteriaDTO> => O.fromNullable(checkPrerequisites[id]);

export const getPrerequisitesErrorByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<OnboardingErrorDTO> => O.fromNullable(prerequisitesErrors[id]);
