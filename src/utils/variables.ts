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
        action: "iohandledlink://email:test@test.it"
    cta_2: 
        text: "myportal"
        action: "ioit://SERVICE_WEBVIEW?url=http://127.0.0.1:3000/myportal_playground.html"
en:
    cta_1: 
        text: "email"
        action: "iohandledlink://email:test@test.it"
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
---`;

export const frontMatter1CTABonusBpdIban = `---
it:
    cta_1: 
        text: "BPD Iban"
        action: "ioit://CTA_BPD_IBAN_EDIT"
en:
    cta_1: 
        text: "BPD Iban"
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
        text: "CGN start"
        action: "ioit://CTA_START_CGN"
en:
    cta_1: 
        text: "CGN start"
        action: "ioit://CTA_START_CGN"
---`;

export const messageMarkdown = `
# H1 

## H2 

### H3 

#### H4

esempio di lista: 

- item1
- item2 
- item3 
- item4 
- item5 
- item6 


esempio di numerata: 

1. item1
1. item2 
1. item3 
1. item4 
1. item5 
1. item6 


È universalmente **riconosciuto** che un _lettore_ che **osserva** il layout di una pagina viene distratto dal contenuto testuale se questo è leggibile. Lo scopo dell’utilizzo del Lorem Ipsum è che offre una normale distribuzione delle lettere (al contrario di quanto avviene se si utilizzano brevi frasi ripetute, ad esempio “testo qui”), apparendo come un normale blocco di testo leggibile. Molti software di impaginazione e di web design utilizzano Lorem Ipsum come testo modello. Molte versioni del testo sono state prodotte negli anni, a volte casualmente, a volte di proposito (ad esempio inserendo passaggi ironici).

| copia e incolla il seguente link: \`https://verylongurl.com/verylong_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_very_long_\`

### link esterni

il link deve **sempre** includere il protocollo (http:// o https://)

[DESCRIZIONE LINK](https://www.google.it)

[LINK NON VALIDO -1](www.google.it)

[LINK NON VALIDO -2](google.it)

### link interni

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

[SERVICE WEBVIEW](ioit://SERVICE_WEBVIEW?url=https://www.google.com)

[LINK CORROTTO](ioit://WRONG&$)
`;
