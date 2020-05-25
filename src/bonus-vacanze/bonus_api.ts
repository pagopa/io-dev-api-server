import { Router } from "express";
import * as fs from "fs";
export const bonusVacanze = Router();

const qrCodeBonusVacanze = fs
  .readFileSync("assets/imgs/bonus-vacanze/qr_code_bonus_vacanze.png")
  .toString("base64");

// get the list of all available bonuses
bonusVacanze.get("/", (_, res) => {
  const bonuses = {
    items: [
      {
        id: 1,
        name: "Bonus Vacanze",
        description: "descrizione bonus vacanze",
        valid_from: "2020-07-01T00:00:00.000Z",
        valid_to: "2020-12-31T23:59:59.000Z",
        cover:
          "https://gdsit.cdn-immedia.net/2018/08/fff810d2e44464312e70071340fd92fc.jpg"
      },
      {
        id: 2,
        name: "Bonus che non esiste",
        description: "descrizione bonus che non esiste",
        valid_from: "2020-05-25T00:00:00.000Z",
        valid_to: "2020-06-01T23:59:59.000Z",
        cover:
          "https://www.pensionipertutti.it/wp-content/uploads/2020/05/bonus-600-euro-autonomi.jpg"
      }
    ]
  };
  res.json(bonuses);
});

// check if can activate bonus
bonusVacanze.get(`/can-activate/:id_bonus`, (_, res) => {
  // could be
  // 200 -> can activate
  // 403 -> can't activate (maybe some other activated it before)
  res.sendStatus(200);
  // this is only a mock
  /*
  res.send(403).json({
    message:
      "non puoi attivare il bonus perchè è stato già attivato da un componente del tuo nucleo familiare",
    when: "2020-07-04T12:20:00.000Z"
  });
  */
});

bonusVacanze.get(`/:id_bonus/latest`, (_, res) => {
  const bonus = {
    code: "ABCDE123XYZ",
    status: "ACTIVATED", // could be ACTIVATED | ABORTED | CONSUMED
    qr_code: {
      mime_type: "image/png",
      base64_content: qrCodeBonusVacanze
    },
    max_amount: 50000,
    tax_benefit: 3000,
    activate_at: "2020-07-04T12:20:00.000Z"
  };
  // it could be 200 (a bonus exists)
  // or 404 a bonus doesn't exits
  // client can activate a bonus if: 404 or 200 -> status: ABORTED
  return res.json(bonus);
});
