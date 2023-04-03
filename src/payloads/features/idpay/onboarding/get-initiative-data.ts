import * as O from "fp-ts/lib/Option";
import { InitiativeDataDTO } from "../../../../../generated/definitions/idpay/InitiativeDataDTO";
import faker from "faker/locale/it";
import { ulid } from "ulid";
import { IDPayInitiativeID, IDPayServiceID } from "../types";
import { initiativeIdToString } from "../utils";

const createRandomInitiativeDataDTO = (): InitiativeDataDTO => ({
  initiativeId: ulid(),
  initiativeName: faker.company.catchPhrase(),
  description: faker.lorem.paragraphs(6),
  organizationId: ulid(),
  organizationName: faker.company.companyName(),
  tcLink: "https://google.it",
  privacyLink: "https://google.it",
  logoURL: ""
});

export const initiativeDataResponseByServiceId: Record<
  IDPayServiceID,
  InitiativeDataDTO
> = {
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

export const getInitiativeDataResponseByServiceId = (
  id: IDPayServiceID
): O.Option<InitiativeDataDTO> =>
  O.fromNullable(initiativeDataResponseByServiceId[id]);
