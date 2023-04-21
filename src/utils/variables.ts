import {
  EXPIRED_SIGNATURE_REQUEST_ID,
  REJECTED_SIGNATURE_REQUEST_ID,
  SIGNATURE_REQUEST_ID,
  SIGNED_EXPIRED_SIGNATURE_REQUEST_ID,
  SIGNED_SIGNATURE_REQUEST_ID,
  WAIT_QTSP_SIGNATURE_REQUEST_ID
} from "../payloads/features/fci/signature-request";

export const frontMatter2CTA = `---
it:
  cta_1:
    text: "Attiva il cashback"
    action: "ioit://CTA_START_BPD"
en:
  cta_1:
    text: "Request cashback"
    action: "ioit://CTA_START_BPD"
---
Aderisci al “Cashback” tramite la sezione **Portafoglio** dell’app IO: puoi ottenere un rimborso sugli acquisti effettuati con carte, bancomat e app di pagamento. Il “Cashback” è una delle iniziative del Piano Italia Cashless promosso dal Governo allo scopo di incentivare un maggiore utilizzo di moneta elettronica nel Paese.
#### Chi può richiederlo?
Se hai compiuto i 18 anni e risiedi in Italia, puoi ottenere un **rimborso in denaro** a fronte di acquisti personali e non per uso professionale con i tuoi **metodi di pagamento elettronici** presso **punti vendita fisici** (non online) situati sul territorio nazionale.
#### Come funziona il Cashback?
1. Il programma Cashback si divide in periodi di durata variabile. Il primo periodo **sperimentale** detto **“Extra Cashback di Natale”**, dura **dall'8 al 31 dicembre 2020.** I successivi dureranno 6 mesi ciascuno, a partire dal 1° gennaio 2021.
2. Per ogni periodo potrai ottenere un **rimborso massimo di €150**. Ogni acquisto effettuato con strumenti di pagamento elettronici **registrati** ai fini dell’iniziativa, ti farà accumulare il 10% dell’importo speso, fino ad un massimo di €15 per transazione.
3. Il cashback accumulato ti verrà rimborsato solo se avrai raggiunto il numero minimo di transazioni valide: **10 nel periodo sperimentale**, 50 in ciascuno dei semestri successivi.
4. Oltre al Cashback, **ma solo a partire dal 1° gennaio 2021**, **i primi 100mila** partecipanti che in ogni semestre hanno totalizzato il **maggior numero di transazioni valide**, ricevono un **Super Cashback di €1500**.
5. Al termine del periodo, ricevi il rimborso complessivo accumulato **sull’IBAN che indicherai durante l’attivazione.**
#### Come si aggiungono i metodi di pagamento?
Aggiungi subito i metodi **a te intestati** nella sezione [Portafoglio](ioit://WALLET_HOME), e abilitali al cashback quando richiesto. Ad oggi sono supportate carte di debito, credito, prepagate e PagoBANCOMAT. Stiamo lavorando per supportare altri metodi in futuro, come Bancomat Pay e Satispay. 
#### Come si aggiunge l'IBAN per ricevere il rimborso previsto?
Attiva il Cashback e inserisci l’IBAN quando richiesto. Puoi inserirlo anche in un secondo momento, ma ricordati di farlo entro il termine del periodo per avere diritto al rimborso.
Per poter attivare il Cashback, devi avere aggiornato IO all'ultima versione disponibile. Scaricala adesso!
[App Store](https://apps.apple.com/it/app/io/id1501681835)
[Play Store](https://play.google.com/store/apps/details?id=it.pagopa.io.app)`;

export const frontMatterMyPortal = `---
it:
    cta_1: 
        text: "email"
        action: "iohandledlink://mailto:test@test.it"
    cta_2: 
        text: "myportal"
        action: "ioit://SERVICE_WEBVIEW?url=http://127.0.0.1:3000/myportal_playground.html"
en:
    cta_1: 
        text: "email"
        action: "iohandledlink://mailto:test@test.it"
    cta_2: 
        text: "payments"
        action: "ioit://WALLET_HOME"
---`;

export const frontMatterBonusVacanze = `---
it:
    cta_1: 
        text: "start eligibility"
        action: "ioit://BONUS_CTA_ELIGILITY_START"
    cta_2: 
        text: "bonus list"
        action: "ioit://BONUS_AVAILABLE_LIST"
en:
    cta_1: 
        text: "start eligibility"
        action: "ioit://BONUS_CTA_ELIGILITY_START"
    cta_2: 
        text: "bonus list"
        action: "ioit://BONUS_AVAILABLE_LIST"
---`;

export const frontMatter2CTA2 = `---
it:
    cta_1: 
        text: "io.italia.it"
        action: "iohandledlink://https://io.italia.it"
    cta_2: 
        text: "internal webview"
        action: "ioit://SERVICE_WEBVIEW?url=https://www.google.com"
en:
    cta_1: 
        text: "io.italia.it"
        action: "iohandledlink://https://io.italia.it"
    cta_2: 
        text: "internal webview"
        action: "ioit://SERVICE_WEBVIEW?url=https://www.google.com"
---`;

export const frontMatter1CTABonusBpd = `---
it:
    cta_1: 
        text: "BPD start"
        action: "ioit://CTA_START_BPD"
en:
    cta_1: 
        text: "BPD start EN"
        action: "ioit://CTA_BPD_IBAN_EDIT"
---`;

export const frontMatter1CTABonusBpdIban = `---
it:
    cta_1: 
        text: "BPD Iban"
        action: "ioit://CTA_BPD_IBAN_EDIT"
en:
    cta_1: 
        text: "BPD Iban EN"
        action: "ioit://CTA_BPD_IBAN_EDIT"
---`;

export const frontMatterInvalid = `---
it:
    invalid_1: 
        text: "premi"
        action: "ioit://SERVICES_HOME"
en:
    cta_1: 
        text: "go1"
        action: "dummy://PROFILE_MAIN"
---`;

export const frontMatter1CTABonusCgn = `---
it:
    cta_1: 
        text: "CGN start v2"
        action: "ioit://cgn-activation/start"
    cta_2: 
        text: "CGN start (legacy)"
        action: "ioit://CTA_START_CGN"
en:
    cta_1: 
        text: "CGN start v2"
        action: "ioit://cgn-activation/start"
    cta_2: 
        text: "CGN start (legacy)"
        action: "ioit://CTA_START_CGN"
---`;

export const frontMatter1CTAV2BonusCgnDetails = `---
it:
    cta_1: 
        text: "Vai alla carta v2"
        action: "ioit://cgn-details/detail"
    cta_2: 
        text: "Vai alla carta (legacy)"
        action: "ioit://CGN_DETAILS"
en:
    cta_1: 
        text: "Vai alla carta v2"
        action: "ioit://cgn-details/detail"
    cta_2: 
        text: "Vai alla carta (legacy)"
        action: "ioit://CGN_DETAILS"
---`;

export const frontMatter1CTAV2BonusCgnCategories = `---
it:
    cta_1: 
        text: "Vai alle categorie di CGN"
        action: "ioit://cgn-details/categories"
    cta_2: 
        text: "Vai agli operatori di Cultura"
        action: "ioit://cgn-details/categories-merchant/cultureAndEntertainment"
en:
    cta_1: 
        text: "Go to the CGN categories"
        action: "ioit://cgn-details/categories"
    cta_2: 
        text: "Go to Culture operators"
        action: "ioit://cgn-details/categories-merchant/cultureAndEntertainment"
---`;

export const frontMatter1CTASiciliaVola = `---
it:
    cta_1: 
        text: "Generate voucher"
        action: "ioit://SV_CHECK_STATUS"
    cta_2: 
        text: "Voucher List"
        action: "ioit://SV_VOUCHER_LIST"
en:
    cta_1: 
        text: "Generate voucher"
        action: "ioit://SV_CHECK_STATUS"
    cta_2: 
        text: "Voucher List"
        action: "ioit://SV_VOUCHER_LIST"
---`;

export const frontMatter1CTAFims = `---
it:
    cta_1: 
        text: "Fims SSO"
        action: "iosso://http://localhost:3000/myportal_playground.html"
en:
    cta_1: 
        text: "Fims SSO"
        action: "iosso://http://localhost:3000/myportal_playground.html"
---`;

export const frontMatterCTAFCISignatureRequest = `---
it:
    cta_1: 
        text: "Vai ai documenti"
        action: "ioit://fci/main?signatureRequestId=${SIGNATURE_REQUEST_ID}"
en:
    cta_1: 
        text: "Go to the documents"
        action: "ioit://fci/main?signatureRequestId=${SIGNATURE_REQUEST_ID}"
---`;

export const frontMatterCTAFCISignatureRequestExpired = `---
it:
    cta_1: 
        text: "Vai ai documenti"
        action: "ioit://fci/main?signatureRequestId=${EXPIRED_SIGNATURE_REQUEST_ID}"
en:
    cta_1: 
        text: "Go to the documents"
        action: "ioit://fci/main?signatureRequestId=${EXPIRED_SIGNATURE_REQUEST_ID}"
---`;

export const frontMatterCTAFCISignatureRequestWaitQtsp = `---
it:
    cta_1: 
        text: "Vai ai documenti"
        action: "ioit://fci/main?signatureRequestId=${WAIT_QTSP_SIGNATURE_REQUEST_ID}"
en:
    cta_1: 
        text: "Go to the documents"
        action: "ioit://fci/main?signatureRequestId=${WAIT_QTSP_SIGNATURE_REQUEST_ID}"
---`;

export const frontMatterCTAFCISignatureRequestRejected = `---
it:
    cta_1: 
        text: "Visualizza i documenti"
        action: "ioit://fci/main?signatureRequestId=${REJECTED_SIGNATURE_REQUEST_ID}"
en:
    cta_1: 
        text: "View documents"
        action: "ioit://fci/main?signatureRequestId=${REJECTED_SIGNATURE_REQUEST_ID}"
---`;

export const frontMatterCTAFCISignatureRequestSigned = `---
it:
    cta_1: 
        text: "Visualizza i documenti"
        action: "ioit://fci/main?signatureRequestId=${SIGNED_SIGNATURE_REQUEST_ID}"
en:
    cta_1: 
        text: "View documents"
        action: "ioit://fci/main?signatureRequestId=${SIGNED_SIGNATURE_REQUEST_ID}"
---`;

export const frontMatterCTAFCISignatureRequestSignedExpired = `---
it:
    cta_1: 
        text: "Visualizza i documenti"
        action: "ioit://fci/main?signatureRequestId=${SIGNED_EXPIRED_SIGNATURE_REQUEST_ID}"
en:
    cta_1: 
        text: "View documents"
        action: "ioit://fci/main?signatureRequestId=${SIGNED_EXPIRED_SIGNATURE_REQUEST_ID}"
---`;

export const messageFciMarkdown = `
**Comune di Controguerra** ha richiesto la firma dei documenti relativi a **Informativa Carta d'Identità Elettronica**.\n\n
Puoi leggere e firmare i documenti direttamente in app: ti basterà confermare l'operazione con il **codice di sblocco** o 
l’**autenticazione biometrica** del tuo dispositivo.\n\n
Ti ricordiamo che la richiesta di firma scadrà il **12/02/2023** pertanto ti invitiamo a firmare il prima possibile.
`;

export const messageFciSignedMarkdown = `
I documenti che hai firmato sono pronti!\n\n
Hai **90 giorni** dalla ricezione di questo messaggio per visualizzarli e salvarli sul tuo dispositivo. 
`;

export const thirdPartyMessagePreconditionMarkdown = `

Se continui, la notifica risulterà legalmente recapitata a te. Aprire il messaggio su IO equivale infatti a firmare la ricevuta di ritorno di una raccomandata tradizionale.

:u[Questo è il testo che deve essere sottolineato]

**Mittente**: Comune di Milano  \n**Oggetto**: Infrazione al codice della strada  \n**Data e ora**: 12 Luglio 2022 - 12.36  \n**Codice IUN**: YYYYMM-1-ABCD-EFGH-X  \n

`;

export const messageMarkdown = `
# H1 

## H2 

### H3 

#### H4

-----

### an image
![A cat](data:image/jpg;base64,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)

-----

### item list

- item1
- item2 
- item3 
- item4 
- item5 
- item6 

-----

### enumerated list

1. item1
1. item2 
1. item3 
1. item4 
1. item5 
1. item6 

-----

### formatted text
È universalmente **riconosciuto** che un _lettore_ che **osserva** il layout di una pagina viene distratto dal contenuto testuale se questo è leggibile. Lo scopo dell’utilizzo del Lorem Ipsum è che offre una normale distribuzione delle lettere (al contrario di quanto avviene se si utilizzano brevi frasi ripetute, ad esempio “testo qui”), apparendo come un normale blocco di testo leggibile. Molti software di impaginazione e di web design utilizzano Lorem Ipsum come testo modello. Molte versioni del testo sono state prodotte negli anni, a volte casualmente, a volte di proposito (ad esempio inserendo passaggi ironici).

| copia e incolla il seguente link: \`https://verylongurl.com/verylong_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_\`

-----

### external links

a link must **always** include the protocol (\`http://\` or \`https://\`)

[Google](https://www.google.it)

[Invalid link -1](www.google.it)

[Invalid link -2](google.it)

-----

### Internal navigation

[BONUS_AVAILABLE_LIST](ioit://BONUS_AVAILABLE_LIST)

[BONUS_CTA_ELIGILITY_START](ioit://BONUS_CTA_ELIGILITY_START)

[MESSAGES_HOME](ioit://MESSAGES_HOME)

[PROFILE_PREFERENCES_HOME](ioit://PROFILE_PREFERENCES_HOME)

[SERVICES_HOME](ioit://SERVICES_HOME)

[PROFILE_MAIN](ioit://PROFILE_MAIN)

[PROFILE_PRIVACY](ioit://PROFILE_PRIVACY)

[PROFILE_PRIVACY_MAIN](ioit://PROFILE_PRIVACY_MAIN)

[WALLET_HOME](ioit://WALLET_HOME)

[WALLET_LIST](ioit://WALLET_LIST)

[PAYMENTS_HISTORY_SCREEN](ioit://PAYMENTS_HISTORY_SCREEN)

[WALLET_HOME con parametri](ioit://WALLET_HOME?param1=a&param2=b&param3=c&param4=100)

[CGN Start (legacy)](ioit://CTA_START_CGN)

[CGN Start v2](ioit://cgn-activation/start)

[CGN Details (legacy)](ioit://CGN_DETAILS)

[CGN Details v2](ioit://cgn-details/detail)

[CGN Categories screen](ioit://cgn-details/categories)

[CGN culture category merchant](ioit://cgn-details/categories-merchant/cultureAndEntertainment)

[BPD Opt-in choice](ioit://wallet/bpd-opt-in/choice)

[SERVICE WEBVIEW](ioit://SERVICE_WEBVIEW?url=https://www.google.com)

[LINK CORROTTO](ioit://WRONG&$)

[LINK navigation v2 errore](ioit://cgn/details)

[PN Activation](ioit://services/service-detail?serviceId=servicePN&activate=true)

### Handled link
[http - google](iohandledlink://http://www.google.com)

[https - google](iohandledlink://https://www.google.com)

[clipboard](iohandledlink://copy:textcopy)

[sms](iohandledlink://sms:+123456789)

[tel](iohandledlink://tel:+123456789)

[mailto](iohandledlink://mailto:name.surname@email.com)

`;
