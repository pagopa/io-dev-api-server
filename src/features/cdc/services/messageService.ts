import { IoDevServerConfig } from "../../../types/config";
import { CreatedMessageWithContentAndAttachments } from "../../../../generated/definitions/backend/CreatedMessageWithContentAndAttachments";
import { nextMessageIdAndCreationDate } from "../../messages/utils";
import { validatePayload } from "../../../utils/validator";
import { cdcServiceId } from "../../services/persistence/services/special/cdc-service";
import { CreatedMessageWithContent } from "../../../../generated/definitions/backend/CreatedMessageWithContent";

const successCtasMarkdown = `---
it:
  cta_2:
    text: "Dove puoi usarla"
    action: "iohandledlink://https://www.cartadellacultura.it/cartaculturaEsercente/#/doveUsareBuoni"
  cta_1:
    text: "Vai alla Carta della Cultura"
    action: "ioit://main/wallet"
---`;

const createCdcMessageTemplates = [
  {
    subject: "La tua Carta della Cultura è pronta!",
    markdown: `${successCtasMarkdown}
Ciao!
Il tuo **nucleo familiare** ha ottenuto la Carta della Cultura per il:
* **202Y**
* **202Z**

È disponibile ora nella sezione Portafoglio.

Puoi usarla per acquistare libri, sia cartacei che digitali, generando uno o più buoni in base al credito disponibile.

Vuoi avere più informazioni su come usare i buoni? [Leggi come fare](https://link.alla.guida.come.fare)
`
  },
  {
    subject: "Non è stato possibile assegnarti la Carta della Cultura",
    markdown: `Ciao!
Purtroppo non è stato possibile assegnarti la Carta della Cultura.

La richiesta non è stata accolta, ecco perché:
* **202X** : <ISEE non presente>
* **202V** : <ISEE non conforme>
* **202K** : <non rientri in graduatoria per fondi insufficienti.>

Grazie per aver partecipato all’iniziativa.
`
  },
  {
    subject: "Carta della Cultura: abbiamo aggiornamenti sulla tua richiesta",
    markdown: `${successCtasMarkdown}
Ciao!
Ecco l’esito delle tue richieste per l’ottenimento della Carta della Cultura.

Il tuo **nucleo familiare** ha ottenuto la Carta della Cultura per il:
* **202Y**
* **202Z**

Per gli altri anni, invece, la richiesta non è stata accolta:
* **202X** : <ISEE non presente>
* **202V** : <ISEE non conforme>
* **202K** : <non rientri in graduatoria per fondi insufficienti.>

Puoi trovare la tua Carta nella sezione Portafoglio e usarla per acquistare libri, generando uno o più buoni in base al credito disponibile.
`
  }
];

export const createCDCMessages = (
  customConfig: IoDevServerConfig
): CreatedMessageWithContentAndAttachments[] => {
  // feature flag guard
  if (!customConfig.features?.bonus?.cdc?.enabled) {
    return [];
  }

  const fiscalCode = customConfig.profile.attrs.fiscal_code;

  return createCdcMessageTemplates.map(template => {
    const { id, created_at } = nextMessageIdAndCreationDate();

    return validatePayload(CreatedMessageWithContent, {
      content: template,
      created_at,
      fiscal_code: fiscalCode,
      id,
      message_title: template.subject ?? "This message has no title",
      sender_service_id: cdcServiceId,
      service_name: "Ministero della Cultura"
    });
  });
};
