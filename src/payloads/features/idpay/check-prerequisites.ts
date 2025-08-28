import { fakerIT as faker } from "@faker-js/faker";
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
      .between({ from: "1990-01-01", to: "1999-12-31" })
      .getFullYear()
      .toString(),
    value2: faker.date
      .between({ from: "1990-01-01", to: "2023-12-31" })
      .getFullYear()
      .toString()
  },
  {
    code: CodeEnum.ISEE,
    authority: AuthorityEnum.AGID,
    description: "ISEE",
    operator: getRandomEnumValue(OperatorEnum),
    value: faker.finance.amount({ min: 10000, max: 100000 }),
    value2: faker.finance.amount({ min: 10000, max: 100000 })
  },
  {
    code: CodeEnum.RESIDENCE,
    authority: AuthorityEnum.AGID,
    description: "Residenza",
    operator: [OperatorEnum.EQ, OperatorEnum.NOT_EQ][faker.number.int(1)],
    value: faker.location.country()
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
        description: "<devi selezionare un’opzione di ISEE>",
        value: [
          "Avere un ISEE inferiore a 25.000€",
          "Avere un ISEE superiore a 25.000€",
          "Non avere un ISEE"
        ]
      },
      {
        _type: SelfDeclarationBoolType.boolean,
        code: ulid(),
        description:
          "Usare il bonus per sostituire un elettrodomestico e smaltire quello attuale",
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
  },
  [IDPayInitiativeID.KO_STATUS_TOO_MANY_REQUESTS]: {
    code: OnboardingErrorCodeEnum.ONBOARDING_TOO_MANY_REQUESTS,
    message: ""
  }
};

export const getCheckPrerequisitesResponseByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<RequiredCriteriaDTO> => O.fromNullable(checkPrerequisites[id]);

export const getPrerequisitesErrorByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<OnboardingErrorDTO> => O.fromNullable(prerequisitesErrors[id]);
