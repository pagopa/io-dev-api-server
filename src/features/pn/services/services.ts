import { ScopeTypeEnum } from "../../../../generated/definitions/services/ScopeType";
import { ServiceDetails } from "../../../../generated/definitions/services/ServiceDetails";
import { ServiceId } from "../../../../generated/definitions/services/ServiceId";
import { SpecialServiceCategoryEnum } from "../../../../generated/definitions/services/SpecialServiceCategory";
import {} from "../../services/persistence/services/factory";
import { validatePayload } from "../../../utils/validator";
import { StandardServiceCategoryEnum } from "../../../../generated/definitions/services/StandardServiceCategory";

export const sendOptInServiceId = "01G74SW1PSM6XY2HM5EGZHZZET" as ServiceId;
export const sendServiceId = "01G40DWQGKY5GRWSNM4303VNRP" as ServiceId;

export const pnOptInCTA = `---
it:
    cta_1: 
        text: "Attiva il servizio"
        action: "ioit://services/service-detail?serviceId=${sendServiceId}&activate=true"
en:
    cta_1: 
        text: "Turn service on"
        action: "ioit://services/service-detail?serviceId=${sendServiceId}&activate=true"
---`;

export const createSENDService = (): ServiceDetails => {
  const sendService = {
    description:
      "SEND digitalizza e semplifica le comunicazioni a valore legale come multe o altre comunicazioni importanti. Ti permette infatti di visualizzare, pagare e gestire le notifiche direttamente online o in app.\n\n**Tramite IO potrai:**\n- **risparmiare** i costi delle raccomandate cartacee;\n- **non perdere nessuna comunicazione** ricevendo immediatamente un messagio per ogni notifica indirizzata a te;\n- leggere il contenuto della notifica e visualizzare gli allegati;\n- pagare direttamente in app eventuali costi.\n\nAprire un messaggio inviato dal servizio \"Notifiche digitali\" di SEND equivale a firmare la ricevuta di ritorno di una raccomandata tradizionale.\n\nSe non hai una PEC nei registri pubblici, non l'hai fornita su SEND o l'hai fornita ma risulta inattiva, satura o non valida e apri su IO un messaggio inviato da questo servizio entro 5 giorni (120 ore) dal suo invio, non riceverai la notifica tramite raccomandata.",
    id: sendServiceId,
    name: "SEND - Notifiche digitali",
    organization: {
      fiscal_code: "15376371009",
      name: "IO - L'app dei servizi pubblici"
    },
    metadata: {
      scope: ScopeTypeEnum.NATIONAL,
      web_url: "https://notifichedigitali.it/cittadini",
      tos_url: "https://cittadini.notifichedigitali.it/termini-di-servizio",
      privacy_url: "https://cittadini.notifichedigitali.it/informativa-privacy",
      support_url: "https://assistenza.notifichedigitali.it/hc/it",
      category: SpecialServiceCategoryEnum.SPECIAL,
      custom_special_flow: "pn"
    }
  };
  return validatePayload(ServiceDetails, sendService);
};

export const createSENDOptInService = (): ServiceDetails => {
  const sendOptInService = {
    description:
      "SEND digitalizza e semplifica le comunicazioni a valore legale. Ti permette infatti di leggere e pagare le notifiche direttamente online o in app.\n\nTramite IO, potrai ricevere messaggi relativi alle novità e agli aggiornamenti del servizio.",
    id: sendOptInServiceId,
    name: "SEND - Novità e aggiornamenti",
    organization: {
      fiscal_code: "15376371009",
      name: "IO - L'app dei servizi pubblici"
    },
    metadata: {
      scope: ScopeTypeEnum.NATIONAL,
      web_url: "https://notifichedigitali.it/cittadini",
      tos_url: "https://cittadini.notifichedigitali.it/termini-di-servizio",
      privacy_url: "https://cittadini.notifichedigitali.it/informativa-privacy",
      support_url:
        "https://assistenza.ioapp.it/hc/it/sections/30831007235089-Notiche-SEND",
      category: StandardServiceCategoryEnum.STANDARD
    }
  };
  return validatePayload(ServiceDetails, sendOptInService);
};
