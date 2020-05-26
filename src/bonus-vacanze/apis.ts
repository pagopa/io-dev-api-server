import { Router } from "express";
import * as fs from "fs";
import { Second } from "italia-ts-commons/lib/units";
import { uuidv4 } from "../utils/strings";
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

// return the last istance of the bonus from category id_bonus
bonusVacanze.get(`/bonus/vacanze/activation`, (_, res) => {
  const bonus = {
    code: "ABCDE123XYZ",
    status: "ACTIVE", // could be ACTIVABLE, ACTIVE, ABORTED, FAILED, CONSUMED
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
  // client can activate a bonus if: 404 or (200 && status == ABORTED)
  return res.json(bonus);
});

export const resetBonusVacanze = () => {
  id_task = undefined;
  firstRequestTime = 0;
};

// Start bonus eligibility check (ISEE)
bonusVacanze.post("/eligibility", (_, res) => {
  if (id_task) {
    // a task already exists because it has been requested
    // return conflict status
    res.status(409).json({ id_task });
    return;
  }
  firstRequestTime = new Date().getTime();
  id_task = uuidv4();
  // first time return the id of the created task -> request accepted
  res.status(202).json({ id: id_task });
});

// tslint:disable-next-line: no-let
let id_task: string | undefined;
// tslint:disable-next-line: no-let
let firstRequestTime = 0;
const responseIseeAfter = 20 as Second;
// Get eligibility (ISEE) check information for user's bonus
bonusVacanze.get("/eligibility", (_, res) => {
  const iseeCheck = {
    members: [
      {
        name: "Mario",
        surname: "Rossi"
      },
      {
        name: "Giulia",
        surname: "Rossi"
      },
      {
        name: "Piero",
        surname: "Rossi"
      }
    ],
    max_amount: 50000,
    tax_benefit: 3000
  };
  // no task created, not-found
  if (id_task === undefined) {
    res.sendStatus(404);
    return;
  }
  const elapsedTime = (new Date().getTime() - firstRequestTime) / 1000;
  // if elapsedTime is less than responseIseeAfter return pending status
  // first time return the id of the created task
  if (elapsedTime < responseIseeAfter) {
    // processing request
    res.sendStatus(202);
    return;
  }
  // possible states NO_DATA, ELIGIBLE, INELIGIBLE, NOT_FOUND
  // Request processed
  // TODO we should mock also the ERROR case
  res.status(200).json({ ...iseeCheck, status: "ELIGIBLE" });
});

// Cancel bonus eligibility check procedure (avoids sending a push notification when done)
bonusVacanze.delete("/eligibility", (_, res) => {
  if (id_task) {
    // Request canceled.
    res.status(200).json({ id_task });
    return;
  }
  // not found
  res.status(404);
});
