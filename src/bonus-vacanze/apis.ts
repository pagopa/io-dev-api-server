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
        id_type: 1,
        name: "Bonus Vacanze",
        description: "descrizione bonus vacanze",
        valid_from: "2020-07-01T00:00:00.000Z",
        valid_to: "2020-12-31T23:59:59.000Z",
        cover:
          "https://gdsit.cdn-immedia.net/2018/08/fff810d2e44464312e70071340fd92fc.jpg"
      },
      {
        id_type: 2,
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

// Get all IDs of the bonus activations requested by
// the authenticated user or by any between his family member
bonusVacanze.get(`/activations`, (_, res) => {
  const activations = {
    items: [
      {
        id: "ABC",
        is_applicant: false
      },
      {
        id: "DEF",
        is_applicant: false
      },
      {
        id: "GHJ",
        is_applicant: false
      }
    ]
  };
  return res.json(activations);
});

// tslint:disable-next-line: no-let
let id_task: string | undefined;
// tslint:disable-next-line: no-let
let firstRequestTime = 0;
const responseIseeAfter = 8 as Second;
// Get eligibility (ISEE) check information for user's bonus

// util function to reset some data structures
export const resetBonusVacanze = () => {
  id_task = undefined;
  firstRequestTime = 0;
};

// Start bonus eligibility check (ISEE)
bonusVacanze.post("/eligibility", (_, res) => {
  if (id_task) {
    // a task already exists because it has been requested
    // return conflict status
    res.status(409).json({ id: id_task });
    return;
  }
  firstRequestTime = new Date().getTime();
  id_task = uuidv4();
  // first time return the id of the created task -> request accepted
  res.status(202).json({ id: id_task });
});

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
  if (id_task && elapsedTime < responseIseeAfter) {
    // request accepted, return the task id
    res.status(202).json({ id: id_task });
    return;
  }
  // possible states
  // - USER_NOT_FOUND    User not found in INPS database
  // - ISEE_NOT_FOUND    User found but there's no ISEE data
  // - ELIGIBILE         The user is eligible for the bonus
  // - INELIGIBLE        The user is not eligible for the bonus
  // Request processed
  // TODO we should mock also the ERROR case
  res.status(200).json({ ...iseeCheck, id: id_task, status: "ELIGIBLE" });
});

// Cancel bonus eligibility check procedure (avoids sending a push notification when done)
bonusVacanze.delete("/eligibility", (_, res) => {
  if (id_task) {
    // Request canceled.
    res.status(200).json({ id: id_task });
    return;
  }
  // not found
  res.status(404);
});
