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
    initiativeName: "Iniziativa"
  },
  [IDPayServiceID.ERR_NOT_ELIGIBLE]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_NOT_ELIGIBLE,
    initiativeName: "Iniziativa - Non eligibile"
  },
  [IDPayServiceID.ERR_NO_REQUIREMENTS]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_NO_REQUIREMENTS,
    initiativeName: "Iniziativa - No requisiti"
  },
  [IDPayServiceID.ERR_ONBOARDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_ONBOARDED,
    initiativeName: "Iniziativa - Onboarding terminato"
  },
  [IDPayServiceID.ERR_UNSUBSCRIBED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_UNSUBSCRIBED,
    initiativeName: "Iniziativa - Recesso"
  },
  [IDPayServiceID.ERR_ON_EVALUATION]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_ON_EVALUATION,
    initiativeName: "Iniziativa - In valutazione"
  },
  [IDPayServiceID.OK_INVITED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_INVITED,
    initiativeName: "Iniziativa - Con invito"
  },
  [IDPayServiceID.ERR_BUDGET_TERMINATED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_BUDGET_TERMINATED,
    initiativeName: "Iniziativa - No budget"
  },
  [IDPayServiceID.ERR_ENDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_ENDED,
    initiativeName: "Iniziativa - Terminata"
  },
  [IDPayServiceID.ERR_NOT_STARTED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_NOT_STARTED,
    initiativeName: "Iniziativa - Non iniziata"
  },
  [IDPayServiceID.ERR_SUSPENDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.ERR_SUSPENDED,
    initiativeName: "Iniziativa - Sospesa"
  },
  [IDPayServiceID.OK_NO_PREREQUISITES]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_NO_PREREQUISITES,
    initiativeName: "Iniziativa - Senza prerequisiti"
  },
  [IDPayServiceID.OK_PDND_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_PDND_ONLY,
    initiativeName: "Iniziativa - Solo PDND"
  },
  [IDPayServiceID.OK_SELF_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_SELF_ONLY,
    initiativeName: "Iniziativa - Solo auto dichiarazioni"
  },
  [IDPayServiceID.OK_SELF_MULTI_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_SELF_MULTI_ONLY,
    initiativeName: "Iniziativa - Solo auto dichiarazioni multi"
  },
  [IDPayServiceID.OK_SELF_BOOL_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: IDPayInitiativeID.OK_SELF_BOOL_ONLY,
    initiativeName: "Iniziativa - Solo auto dichiarazioni bool"
  }
};
