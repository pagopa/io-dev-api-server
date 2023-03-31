import { InitiativeDataDTO } from "../../../../../generated/definitions/idpay/InitiativeDataDTO";
import faker from "faker/locale/it";
import { ulid } from "ulid";
import { IDPayInitiativeID, IDPayServiceID } from "./ids";

const createRandomInitiativeDataDTO = (): InitiativeDataDTO => ({
  initiativeId: ulid(),
  initiativeName: faker.company.catchPhrase(),
  description: faker.lorem.paragraphs(4),
  organizationId: ulid(),
  organizationName: faker.company.companyName(),
  tcLink: "https://google.it",
  privacyLink: "https://google.it",
  logoURL: ""
});

export const getInitiativeDataResponseByServiceId: {
  [id: string]: InitiativeDataDTO;
} = {
  [IDPayServiceID.OK]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK,
    initiativeName: "Iniziativi"
  },
  [IDPayServiceID.ERR_NOT_ELIGIBLE]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_NOT_ELIGIBLE,
    initiativeName: "Iniziativi - Non eligibile"
  },
  [IDPayServiceID.ERR_NO_REQUIREMENTS]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_NO_REQUIREMENTS,
    initiativeName: "Iniziativi - No requisiti"
  },
  [IDPayServiceID.ERR_ONBOARDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_ONBOARDED,
    initiativeName: "Iniziativi - Onboarding terminato"
  },
  [IDPayServiceID.ERR_UNSUBSCRIBED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_UNSUBSCRIBED,
    initiativeName: "Iniziativi - Recesso"
  },
  [IDPayServiceID.ERR_ON_EVALUATION]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_ON_EVALUATION,
    initiativeName: "Iniziativi - In valutazione"
  },
  [IDPayServiceID.OK_INVITED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_INVITED,
    initiativeName: "Iniziativi - Con invito"
  },
  [IDPayServiceID.ERR_BUDGET_TERMINATED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_BUDGET_TERMINATED,
    initiativeName: "Iniziativi - No budget"
  },
  [IDPayServiceID.ERR_ENDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_ENDED,
    initiativeName: "Iniziativi - Terminata"
  },
  [IDPayServiceID.ERR_NOT_STARTED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_NOT_STARTED,
    initiativeName: "Iniziativi - Non iniziata"
  },
  [IDPayServiceID.ERR_SUSPENDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_SUSPENDED,
    initiativeName: "Iniziativi - Sospesa"
  },
  [IDPayServiceID.OK_NO_PREREQUISITES]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_NO_PREREQUISITES,
    initiativeName: "Iniziativi - Senza prerequisiti"
  },
  [IDPayServiceID.OK_PDND_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_PDND_ONLY,
    initiativeName: "Iniziativi - Solo PDND"
  },
  [IDPayServiceID.OK_SELF_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_SELF_ONLY,
    initiativeName: "Iniziativi - Solo auto dichiarazioni"
  },
  [IDPayServiceID.OK_SELF_MULTI_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_SELF_MULTI_ONLY,
    initiativeName: "Iniziativi - Solo auto dichiarazioni multi"
  },
  [IDPayServiceID.OK_SELF_BOOL_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_SELF_BOOL_ONLY,
    initiativeName: "Iniziativi - Solo auto dichiarazioni bool"
  }
};
