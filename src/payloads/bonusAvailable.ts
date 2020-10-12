import { BonusesAvailable } from "../../generated/definitions/content/BonusesAvailable";

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

const contentBonusBdp = `Ottieni un rimborso quando usi i tuoi strumenti di pagamento elettronico per pagare nei negozi

**Come funziona?**

Aggiungi in IO i tuoi strumenti di pagamento elettronico e attiva, su quelli che preferisci, il cashback.
Indica a quale IBAN vuoi ottenere il rimborso.
Quando paghi con questi struementi ti verrà riconosciuto un credito pari al 10% della tua transazione (fino ad un massimo di 150€).
Il giorno seguente riceverai sui IO un aggiornamento sui tuoi punti. 
Ogni 6 mesi, se risulti nei primi centomila cittadini che hanno effettuato più transazioni, puoi ricevere fino a 1500€ di SUper Cashback!
`;

export const availableBonuses: BonusesAvailable = [
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
        "Un rimborso del 10% sui tuoi pagamenti elettronici e un premio fino a 1000€ per chi fa più transazioni",
      title: "Cashback Pagamenti Digitali",
      content: contentBonusBdp,
      tos_url: "https://io.italia.it/app-content/tos_privacy.html"
    },
    en: {
      name: "Cashback Pagamenti Digitali [EN]",
      subtitle: "sub title BDP",
      title: "Richiesta Bonus Cashback Pagamenti Digitali [EN]",
      content: contentBonusBdp,
      tos_url: "https://io.italia.it/app-content/tos_privacy.html"
    },
    hidden: false,
    service_id: "01EB8AXKNV6NMSP2R25KSGF743",
    is_active: true,
    valid_from: new Date("2021-01-01T00:00:00.000Z"),
    valid_to: new Date("2021-06-30T00:00:00.000Z"),
    cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/vacanze/logo/logo_BonusVacanze.png",
    sponsorship_description: "Ministero Economia e Finanze",
    sponsorship_cover:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/bonus/vacanze/logo/logo_AgenziaEntrate.png"
  }
];
