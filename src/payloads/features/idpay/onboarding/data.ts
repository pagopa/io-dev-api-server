import { faker } from "@faker-js/faker/locale/it";
import { ulid } from "ulid";
import { InitiativeDataDTO } from "../../../../../generated/definitions/idpay/InitiativeDataDTO";
import { StatusEnum as OnboardingStatusEnum } from "../../../../../generated/definitions/idpay/OnboardingStatusDTO";
import {
  AuthorityEnum,
  CodeEnum,
  PDNDCriteriaDTO
} from "../../../../../generated/definitions/idpay/PDNDCriteriaDTO";
import {
  DetailsEnum,
  PrerequisitesErrorDTO
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
import { IDPayInitiativeID, IDPayServiceID } from "../types";
import { initiativeIdToString } from "../utils";

const createRandomInitiativeDataDTO = (): InitiativeDataDTO => ({
  initiativeId: ulid(),
  initiativeName: faker.company.catchPhrase(),
  description: faker.lorem.paragraphs(6),
  organizationId: ulid(),
  organizationName: faker.company.name(),
  privacyLink: faker.internet.url(),
  tcLink: faker.internet.url(),
  logoURL: faker.image.avatar()
});

const initiativeData: {
  [id: number]: InitiativeDataDTO;
} = {
  [IDPayServiceID.DEFAULT]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.DEFAULT),
    initiativeName: "Iniziativa"
  },
  [IDPayServiceID.INVITED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.INVITED),
    initiativeName: "Iniziativa - Con invito"
  },
  [IDPayServiceID.NO_PREREQUISITES]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.NO_PREREQUISITES),
    initiativeName: "Iniziativa - Senza prerequisiti"
  },
  [IDPayServiceID.PDND_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.PDND_ONLY),
    initiativeName: "Iniziativa - Solo PDND"
  },
  [IDPayServiceID.SELF_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.SELF_ONLY),
    initiativeName: "Iniziativa - Solo auto dichiarazioni"
  },
  [IDPayServiceID.ERR_STATUS_NOT_ELIGIBLE]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.ERR_STATUS_NOT_ELIGIBLE
    ),
    initiativeName: "Iniziativa - Non eligibile"
  },
  [IDPayServiceID.ERR_STATUS_NO_REQUIREMENTS]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.ERR_STATUS_NO_REQUIREMENTS
    ),
    initiativeName: "Iniziativa - No requisiti"
  },
  [IDPayServiceID.ERR_STATUS_ONBOARDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.ERR_STATUS_ONBOARDED),
    initiativeName: "Iniziativa - Onboarding terminato"
  },
  [IDPayServiceID.ERR_STATUS_UNSUBSCRIBED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.ERR_STATUS_UNSUBSCRIBED
    ),
    initiativeName: "Iniziativa - Recesso"
  },
  [IDPayServiceID.ERR_STATUS_ON_EVALUATION]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.ERR_STATUS_ON_EVALUATION
    ),
    initiativeName: "Iniziativa - In valutazione"
  },
  [IDPayServiceID.ERR_CHECK_BUDGET_TERMINATED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.ERR_CHECK_BUDGET_TERMINATED
    ),
    initiativeName: "Iniziativa - No budget"
  },
  [IDPayServiceID.ERR_CHECK_ENDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.ERR_CHECK_ENDED),
    initiativeName: "Iniziativa - Terminata"
  },
  [IDPayServiceID.ERR_CHECK_NOT_STARTED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.ERR_CHECK_NOT_STARTED),
    initiativeName: "Iniziativa - Non iniziata"
  },
  [IDPayServiceID.ERR_CHECK_SUSPENDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.ERR_CHECK_SUSPENDED),
    initiativeName: "Iniziativa - Sospesa"
  }
};

const onboardingStatuses: {
  [id: number]: OnboardingStatusEnum;
} = {
  [IDPayInitiativeID.INVITED]: OnboardingStatusEnum.INVITED,
  [IDPayInitiativeID.ERR_STATUS_NOT_ELIGIBLE]: OnboardingStatusEnum.ELIGIBLE_KO,
  [IDPayInitiativeID.ERR_STATUS_NO_REQUIREMENTS]:
    OnboardingStatusEnum.ONBOARDING_KO,
  [IDPayInitiativeID.ERR_STATUS_ONBOARDED]: OnboardingStatusEnum.ONBOARDING_OK,
  [IDPayInitiativeID.ERR_STATUS_UNSUBSCRIBED]:
    OnboardingStatusEnum.UNSUBSCRIBED,
  [IDPayInitiativeID.ERR_STATUS_ON_EVALUATION]:
    OnboardingStatusEnum.ON_EVALUATION
};

const pdndCriteria: ReadonlyArray<PDNDCriteriaDTO> = [
  {
    code: CodeEnum.BIRTHDATE,
    authority: AuthorityEnum.INPS,
    description: "Data di nascita",
    value: faker.date
      .past(30)
      .getFullYear()
      .toString()
  },
  {
    code: CodeEnum.BIRTHDATE,
    authority: AuthorityEnum.INPS,
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

export {
  initiativeData,
  onboardingStatuses,
  checkPrerequisites,
  prerequisitesErrors
};
