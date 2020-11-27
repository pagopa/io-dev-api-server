import { BonusesAvailable } from "../../../../generated/definitions/content/BonusesAvailable";

const contentBonusVacanze = `#### Chi può richiederlo?

Il bonus è destinato a tutte le famiglie italiane con un reddito familiare ISEE inferiore a 40.000€.

#### Quanto vale?
Il valore del bonus cambia in base al numero di componenti del nucleo familiare:
- 150€ per un solo componente; 
- 300€ per due componenti; 
- 500€ per più di due componenti.

L’incentivo può essere paragonato a uno sconto pari all’80% del valore del bonus, che viene applicato dalla struttura turistica al momento del pagamento della vacanza. Il restante 20% sarà fruito in forma di detrazione fiscale in fase di dichiarazione dei redditi.

#### Chi, dove e quando può spenderlo?
Ciascun membro del nucleo famigliare può usufruire del bonus. 

Il bonus vacanze è spendibile in un’unica soluzione per acquistare soggiorni di almeno tre notti nelle strutture ricettive italiane, dal 1 luglio al 31 dicembre 2020. 

Il pagamento deve essere eseguito direttamente alla struttura e deve essere documentato tramite la fattura elettronica o attraverso un altro documento commerciale in cui sia indicato il codice fiscale del beneficiario.

#### Come funziona il processo di richiesta?
L’app IO è l’unico canale attraverso cui richiedere il bonus. Puoi richiedere il bonus se hai un ISEE valido e inferiore alla soglia di 40.000€.

Questi sono i passaggi che ti chiederemo di effettuare:
- fai click sul bottone qui sotto; 
- leggi e accetta i termini di servizio e la privacy;
- verificheremo con INPS il tuo ISEE;
- se hai un ISEE valido e sotto la soglia fissata, ti mostreremo a quanto ammonta il tuo bonus e chi sono i componenti del tuo nucleo familiare che potranno beneficiarne;
- conferma la richiesta con il tuo PIN dispositivo o utilizzando il biometrico;
- invieremo la tua richiesta ad Agenzia delle Entrate che la validerà;
- il tuo bonus sarà poi visibile nella sezione Pagamenti.
`;

export const legacyAvailableBonuses: BonusesAvailable = [
  {
    id_type: 1,
    it: {
      name: "Bonus Vacanze",
      subtitle:
        "L'incentivo per supportare il settore del turismo dopo il lockdown richiesto dal COVID-19",
      title: "Richiesta Bonus Vacanze",
      content: contentBonusVacanze,
      tos_url: "https://io.italia.it/app-content/tos_privacy.html"
    },
    en: {
      name: "Bonus Vacanze",
      subtitle:
        "L'incentivo per supportare il settore del turismo dopo il lockdown richiesto dal COVID-19",
      title: "Richiesta Bonus Vacanze",
      content: contentBonusVacanze,
      tos_url: "https://io.italia.it/app-content/tos_privacy.html"
    },
    service_id: "01EB8AXKNV6NMSP2R25KSGF743",
    is_active: true,
    valid_from: new Date("2020-07-01T00:00:00.000Z"),
    valid_to: new Date("2020-12-31T00:00:00.000Z"),
    cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/vacanze/logo/logo_BonusVacanze.png",
    sponsorship_description: "Agenzia delle Entrate",
    sponsorship_cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/vacanze/logo/logo_AgenziaEntrate.png"
  },
  {
    id_type: 2,
    it: {
      name: "Cashback Pagamenti Digitali",
      subtitle:
        "Ottieni un rimborso quando usi i tuoi strumenti di pagamento elettronico per pagare nei negozi",
      title: "Bonus Cashback Pagamenti Digitali",
      content:
        "#### Chi può richiederlo?\n\nSe hai compiuto i 18 anni e risiedi in Italia, puoi ottenere un **rimborso in denaro** a fronte di acquisti effettuati a titolo privato (cioè non per uso professionale) con **strumenti di pagamento elettronici** presso **punti vendita fisici** (non online) situati sul territorio nazionale.\n\n#### Come funziona il Cashback?\n1. Il programma Cashback si divide in periodi di durata variabile. Il primo periodo **sperimentale** dura un mese, **dal 1° al 31 dicembre 2020.** I successivi dureranno 6 mesi ciascuno, a partire dal 1° gennaio 2021.\n2. Per ogni periodo potrai ottenere un **rimborso massimo di €150**. Ogni acquisto effettuato con strumenti di pagamento elettronici **registrati** ai fini dell’iniziativa, ti farà accumulare il 10% dell’importo speso, fino ad un massimo di €15 per transazione.\n3. Il cashback accumulato ti verrà rimborsato solo se avrai raggiunto il numero minimo di transazioni valide: 10 nel periodo sperimentale**, 50 in ciascuno dei semestri successivi.\n4. Oltre al Cashback, **a partire dal 1° gennaio 2021**, **i primi 100mila** partecipanti che in ogni semestre hanno totalizzato il **maggior numero di transazioni valide**, ricevono un **Super Cashback di €1500**.\n5. Al termine del periodo, ricevi il rimborso complessivo accumulato **sull’IBAN che indicherai durante l’attivazione.**",
      tos_url: "https://io.italia.it/cashback/privacy-policy",
      urls: [
        {
          name: "leggi il regolamento completo",
          url: "https://io.italia.it/cashback/guida"
        }
      ]
    },
    en: {
      name: "Cashback Digital Payments",
      subtitle:
        "Get a refund on in-store purchases when using your electronic payment methods",
      title: "Cashback Digital Payments",
      content:
        "#### Who can request it?\n\nIf you are 18 or above and officially registered as resident in Italy, you’re eligible for a **money refund** when you make purchases for personal purposes (i.e. not for business), in **physical point of sales** in Italy.\n\n#### How does Cashback work?\n1. The initiative consists of several periods with a variable duration. The first **test** period lasts 1 month, **from December 1st to 31th 2020.** The next ones will have a duration of 6 months each, starting from January 1st 2021.\n2. During each period you can get a **refund up to €150**. You’ll get a 10% cashback on your purchases performed with your enrolled payment methods, up to €15 per transaction.\n3. The collected Cashback will be refunded only after reaching **the minimum number of valid transactions: 10 within the test period**, 50 within each one of the following semesters.\n4.In addition to Cashback, **starting from January 1st 2021**, **the first 100k** participants who will have collected the **highest amount of valid transactions** in each semester, will get a **€1500 Super Cashback**.\n5. At the end of each period, you will receive the total amount of earned money **on the IBAN account you'll enter during the activation process.**",
      tos_url: "https://io.italia.it/cashback/privacy-policy",
      urls: [
        {
          name: "read the complete regulation",
          url: "https://io.italia.it/cashback/guida"
        }
      ]
    },
    hidden: false,
    service_id: "01EB8AXKNV6NMSP2R25KSGF743",
    is_active: false,
    valid_from: new Date("2020-07-01T00:00:00.000Z"),
    valid_to: new Date("2020-12-31T00:00:00.000Z"),
    cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/bpd/logo/logo-cashback.png",
    sponsorship_description: "Ministero dell'Economia e delle Finanze",
    sponsorship_cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/bpd/logo/logo-mef.png"
  }
];
