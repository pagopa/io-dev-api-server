import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";
import { InitiativeDataDTO } from "../../../../generated/definitions/idpay/InitiativeDataDTO";
import { IDPayInitiativeID, IDPayServiceID } from "./types";
import { initiativeIdToString } from "./utils";

const createRandomInitiativeDataDTO = (): InitiativeDataDTO => ({
  initiativeId: ulid(),
  initiativeName: faker.company.catchPhrase(),
  description: faker.lorem.paragraphs(6),
  organizationId: ulid(),
  organizationName: faker.company.name(),
  privacyLink: faker.internet.url(),
  tcLink: faker.internet.url(),
  logoURL: faker.image.image(480, 480, true)
});

const initiativeData: {
  [id: number]: InitiativeDataDTO;
} = {
  [IDPayServiceID.OK]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.OK),
    initiativeName: "Iniziativa"
  },
  [IDPayServiceID.OK_INVITED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.OK_INVITED),
    initiativeName: "Iniziativa - Con invito"
  },
  [IDPayServiceID.OK_NO_PREREQUISITES]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.OK_NO_PREREQUISITES),
    initiativeName: "Iniziativa - Senza prerequisiti"
  },
  [IDPayServiceID.OK_PDND_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.OK_PDND_ONLY),
    initiativeName: "Iniziativa - Solo PDND"
  },
  [IDPayServiceID.OK_SELF_ONLY]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.OK_SELF_ONLY),
    initiativeName: "Iniziativa - Solo auto dichiarazioni"
  },
  [IDPayServiceID.OK_GUIDONIA]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.OK_GUIDONIA),
    initiativeName: "Iniziativa GUIDONIA"
  },

  [IDPayServiceID.OK_BONUS_ELETTRODOMESTICI]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.OK_BONUS_ELETTRODOMESTICI
    ),
    initiativeName: "BONUS ELETTRODOMESTICI"
  },

  [IDPayServiceID.KO_STATUS_NOT_ELIGIBLE]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.KO_STATUS_NOT_ELIGIBLE
    ),
    initiativeName: "Iniziativa - Non eligibile"
  },
  [IDPayServiceID.KO_STATUS_NO_REQUIREMENTS]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.KO_STATUS_NO_REQUIREMENTS
    ),
    initiativeName: "Iniziativa - No requisiti"
  },
  [IDPayServiceID.KO_STATUS_ONBOARDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.KO_STATUS_ONBOARDED),
    initiativeName: "Iniziativa - Onboarding terminato"
  },
  [IDPayServiceID.KO_STATUS_UNSUBSCRIBED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.KO_STATUS_UNSUBSCRIBED
    ),
    initiativeName: "Iniziativa - Recesso"
  },
  [IDPayServiceID.KO_STATUS_ON_EVALUATION]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.KO_STATUS_ON_EVALUATION
    ),
    initiativeName: "Iniziativa - In valutazione"
  },
  [IDPayServiceID.KO_BUDGET_EXHAUSTED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.KO_BUDGET_EXHAUSTED),
    initiativeName: "Iniziativa - No budget"
  },
  [IDPayServiceID.KO_ENDED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.KO_ENDED),
    initiativeName: "Iniziativa - Terminata"
  },
  [IDPayServiceID.KO_NOT_STARTED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(IDPayInitiativeID.KO_NOT_STARTED),
    initiativeName: "Iniziativa - Non iniziata"
  },
  [IDPayServiceID.KO_FAMILY_UNIT_ALREADY_JOINED]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.KO_FAMILY_UNIT_ALREADY_JOINED
    ),
    initiativeName: "Iniziativa - Nucleo familiare già aderente"
  },
  [IDPayServiceID.KO_ONBOARDING_WAITING_LIST]: {
    ...createRandomInitiativeDataDTO(),
    initiativeId: initiativeIdToString(
      IDPayInitiativeID.KO_ONBOARDING_WAITING_LIST
    ),
    initiativeName: "Iniziativa - Lista d'attesa"
  }
};

export const getInitiativeDataResponseByServiceId = (
  id: IDPayServiceID
): O.Option<InitiativeDataDTO> => O.fromNullable(initiativeData[id]);
