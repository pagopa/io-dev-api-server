import { BonusesAvailable } from "../../../generated/definitions/content/BonusesAvailable";

export const availableBonuses: BonusesAvailable = [
  {
    id_type: 1,
    name: "Bonus Vacanze",
    subtitle: "dal 01/07/2020 al 31/12/2020",
    is_active: true,
    content: "descrizione bonus vacanze",
    valid_from: new Date("2020-07-01T00:00:00.000Z"),
    valid_to: new Date("2020-12-31T00:00:00.000Z"),
    cover:
      "https://gdsit.cdn-immedia.net/2018/08/fff810d2e44464312e70071340fd92fc.jpg",
    sponsorship_cover:
      "https://www.sinetinformatica.it/wp-content/uploads/2020/03/APP-IO-300x260.png"
  },
  {
    id_type: 2,
    name: "Bonus che non esiste",
    subtitle: "subtitle",
    is_active: false,
    content: "descrizione bonus che non esiste",
    valid_from: new Date("2020-07-01T00:00:00.000Z"),
    valid_to: new Date("2020-12-31T00:00:00.000Z")
  }
];
