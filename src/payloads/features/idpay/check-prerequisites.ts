import { fakerIT as faker } from "@faker-js/faker";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";
import {
  CodeEnum as OnboardingErrorCodeEnum,
  OnboardingErrorDTO
} from "../../../../generated/definitions/idpay/OnboardingErrorDTO";
import {
  CodeEnum as AutomatedCriteriaCodeEnum,
  AutomatedCriteriaDTO,
  OperatorEnum
} from "../../../../generated/definitions/idpay/AutomatedCriteriaDTO";
import {
  SelfCriteriaMultiDTO,
  _typeEnum as SelfDeclarationMultiType
} from "../../../../generated/definitions/idpay/SelfCriteriaMultiDTO";
import {
  SelfCriteriaBoolDTO,
  _typeEnum as SelfDeclarationBoolType
} from "../../../../generated/definitions/idpay/SelfCriteriaBoolDTO";
import { _typeEnum as SelfDeclaratioTextType } from "../../../../generated/definitions/idpay/SelfCriteriaTextDTO";
import { InitiativeBeneficiaryRuleDTO } from "../../../../generated/definitions/idpay/InitiativeBeneficiaryRuleDTO";
import { RowDataDTO } from "../../../../generated/definitions/idpay/RowDataDTO";
import { getRandomEnumValue } from "../../utils/random";
import { IDPayInitiativeID } from "./types";

const automatedCriteria: ReadonlyArray<AutomatedCriteriaDTO> = [
  {
    code: AutomatedCriteriaCodeEnum.BIRTHDAY,
    authority: "INPS",
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
    code: AutomatedCriteriaCodeEnum.ISEE,
    authority: "AGID",
    operator: getRandomEnumValue(OperatorEnum),
    value: faker.finance.amount({ min: 10000, max: 100000 }),
    value2: faker.finance.amount({ min: 10000, max: 100000 })
  },
  {
    code: AutomatedCriteriaCodeEnum.RESIDENCE,
    authority: "AGID",
    operator: getRandomEnumValue(OperatorEnum),
    value: faker.location.country()
  }
];

const familyUnityOnlyAutomatedCriteria: ReadonlyArray<AutomatedCriteriaDTO> = [
  {
    code: AutomatedCriteriaCodeEnum.FAMILY_UNIT,
    authority: "Ministero dell'interno",
    operator: OperatorEnum.EQ,
    value: "Mnistero dell'Interno"
  }
];

const criterionArray: ReadonlyArray<RowDataDTO> = [
  {
    description: "Criterion 1",
    subDescription: "Subtitle criterion 1"
  },
  {
    description: "Criterion 2",
    subDescription: "Subtitle criterion 2"
  },
  {
    description: "Criterion 3",
    subDescription: "Subtitle criterion 3"
  }
];
const selfDeclarationMulti: ReadonlyArray<SelfCriteriaMultiDTO> = [
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

const guidoniaSelfDeclarationMulti: ReadonlyArray<SelfCriteriaMultiDTO> = [
  {
    _type: SelfDeclarationMultiType.multi,
    code: ulid(),
    description: "Costituire una famiglia monogenitoriale:",
    value: [
      {
        description: "Sì"
      },
      {
        description: "No"
      }
    ]
  }
];

const selfDeclarationBool: ReadonlyArray<SelfCriteriaBoolDTO> =
  criterionArray.map(criterion => ({
    _type: SelfDeclarationBoolType.boolean,
    code: ulid(),
    description: criterion.description,
    subDescription: criterion.subDescription,
    value: false
  }));

const checkPrerequisites: {
  [id: number]: InitiativeBeneficiaryRuleDTO;
} = {
  [IDPayInitiativeID.OK]: {
    automatedCriteria,
    selfDeclarationCriteria: [...selfDeclarationMulti, ...selfDeclarationBool]
  },
  [IDPayInitiativeID.OK_GUIDONIA]: {
    automatedCriteria,
    selfDeclarationCriteria: [
      ...guidoniaSelfDeclarationMulti,
      {
        _type: SelfDeclaratioTextType.text,
        code: ulid(),
        description:
          "Avere un ISEE valido al 31\\12\\2024 con un valore pari a:",
        value: "valore ISEE"
      },
      {
        _type: SelfDeclaratioTextType.text,
        code: ulid(),
        description:
          "Aver già presentato una Dichiarazione Sostitutive Unica (DSU) con numero di protocollo:",
        value: "Numero di protocollo DSU"
      },
      {
        _type: SelfDeclaratioTextType.text,
        code: ulid(),
        description: "Voler ricevere il rimborso al seguente IBAN:",
        value: "IBAN"
      }
    ]
  },
  [IDPayInitiativeID.OK_PDND_ONLY]: {
    automatedCriteria,
    selfDeclarationCriteria: []
  },
  [IDPayInitiativeID.OK_SELF_ONLY]: {
    automatedCriteria: [],
    selfDeclarationCriteria: [...selfDeclarationMulti, ...selfDeclarationBool]
  },
  [IDPayInitiativeID.BONUS_ELETTRODOMESTICI]: {
    automatedCriteria: familyUnityOnlyAutomatedCriteria,
    selfDeclarationCriteria: [
      {
        _type: SelfDeclarationMultiType.multi,
        code: ulid(),
        description: "Hai un ISEE 2025 in corso di validità?",
        subDescription: "[Quando un ISEE è valido?](https://google.com)",
        value: [
          {
            description: "Sì, inferiore a 25.000€",
            subDescription:
              "Hai diritto fino a 200€. Verificheremo questa informazione con INPS"
          },
          {
            description: "Sì, inferiore a 25.000€",
            subDescription: "Hai diritto fino a 100€"
          },
          {
            description: "Non ho un ISEE o preferisco non rispondere",
            subDescription: "Hai diritto fino a 100€"
          }
        ]
      },
      {
        _type: SelfDeclarationBoolType.boolean,
        code: ulid(),
        description:
          "Userò il bonus per l'acquisto di un elettrodomestico di classe energetica superiore destinato a sostituire un altro della stessa tipologia",
        subDescription: "Ai sensi del D.P.R. 28 dicembre 2000, n. 445",
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
): O.Option<InitiativeBeneficiaryRuleDTO> =>
  O.fromNullable(checkPrerequisites[id]);

export const getPrerequisitesErrorByInitiativeId = (
  id: IDPayInitiativeID
): O.Option<OnboardingErrorDTO> => O.fromNullable(prerequisitesErrors[id]);
