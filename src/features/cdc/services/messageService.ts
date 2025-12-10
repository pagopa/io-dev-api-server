import { IoDevServerConfig } from "../../../types/config";
import { CreatedMessageWithContentAndAttachments } from "../../../../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { nextMessageIdAndCreationDate } from "../../messages/utils";
import { validatePayload } from "../../../utils/validator";
import { cdcServiceId } from "../../services/persistence/services/special/cdc-service";
import { CreatedMessageWithContent } from "../../../../generated/definitions/backend/CreatedMessageWithContent";

const createCdcMessageTemplates = [
  {
    content: {
      subject: "La tua Carta della Cultura è pronta!",
      markdown:
        '---\nit:\n  cta_2:\n    text: "Dove puoi usarla"\n    action: "iohandledlink://https://www.cartadellacultura.it/cartaculturaEsercente/#/doveUsareBuoni"\n  cta_1:\n    text: "Vai alla Carta della Cultura"\n    action: "ioit://main/wallet"\n---\nCiao!\nIl tuo **nucleo familiare** ha ottenuto la Carta della Cultura per il:\n* **202Y**\n* **202Z**\n\nÈ disponibile ora nella sezione Portafoglio.\n\nPuoi usarla per acquistare libri, sia cartacei che digitali, generando uno o più buoni in base al credito disponibile.\n\nVuoi avere più informazioni su come usare i buoni? [Leggi come fare](https://pagopa.zendesk.com/auth/v2/login/signin?auth_origin=30056501290385%2Ctrue%2Ctrue&brand_id=30056501290385&locale=22&return_to=https%3A%2F%2Fassistenza.ioapp.it%2Fhc&role=agent&theme=hc)\n'
    }
  },
  {
    content: {
      subject: "Non è stato possibile assegnarti la Carta della Cultura",
      markdown:
        "Ciao!\nPurtroppo non è stato possibile assegnarti la Carta della Cultura.\n\nLa richiesta non è stata accolta, ecco perché:\n* **202X** : <ISEE non presente>\n* **202V** : <ISEE non conforme>\n* **202K** : <non rientri in graduatoria per fondi insufficienti.>\n\nGrazie per aver partecipato all’iniziativa."
    }
  },
  {
    content: {
      subject: "Carta della Cultura: abbiamo aggiornamenti sulla tua richiesta",
      markdown:
        '---\nit:\n  cta_2:\n    text: "Dove puoi usarla"\n    action: "iohandledlink://https://www.cartadellacultura.it/cartaculturaEsercente/#/doveUsareBuoni"\n  cta_1:\n    text: "Vai alla Carta della Cultura"\n    action: "ioit://main/wallet"\n---\nCiao!\nEcco l’esito delle tue richieste per l’ottenimento della Carta della Cultura.\n\nIl tuo **nucleo familiare** ha ottenuto la Carta della Cultura per il:\n* **202Y**\n* **202Z**\n\nPer gli altri anni, invece, la richiesta non è stata accolta:\n* **202X** : <ISEE non presente>\n* **202V** : <ISEE non conforme>\n* **202K** : <non rientri in graduatoria per fondi insufficienti.>\n\nPuoi trovare la tua Carta nella sezione Portafoglio e usarla per acquistare libri, generando uno o più buoni in base al credito disponibile.'
    }
  }
];

export const createCDCMessages = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] => {
  // feature flag guard
  if (!customConfig.features.bonus.cdc.enabled) {
    return [];
  }

  const fiscal_code = customConfig.profile.attrs.fiscal_code;

  return createCdcMessageTemplates.map(template => {
    const { id, created_at } = nextMessageIdAndCreationDate();

    return validatePayload(CreatedMessageWithContent, {
      content: template.content,
      created_at,
      fiscal_code,
      id,
      message_title: template.content.subject ?? "This message has no title",
      sender_service_id: cdcServiceId,
      service_name: "Ministero della Cultura"
    });
  });
};
