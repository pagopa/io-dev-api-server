import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import * as fs from "fs";
import { Second } from "italia-ts-commons/lib/units";
import { uuidv4 } from "../utils/strings";
export const bonusVacanze = Router();

const qrCodeBonusVacanzeSvg = fs
  .readFileSync("assets/imgs/bonus-vacanze/qr-mysecretcode.svg")
  .toString("base64");

const qrCodeBonusVacanzePng = fs
  .readFileSync("assets/imgs/bonus-vacanze/qr_code_bonus_vacanze.png")
  .toString("base64");

enum BonusStatusEnum {
  "ACTIVE" = "ACTIVE",
  "CANCELLED" = "CANCELLED",
  "FAILED" = "FAILED",
  "CONSUMED" = "CONSUMED"
}

// get the list of all available bonus types
bonusVacanze.get("/", (_, res) => {
  const bonuses = {
    items: [
      {
        id_type: 1,
        service_id: "01DBJNYDCT0Q5G0D0K7RFS2R2F",
        name: "Bonus Vacanze",
        is_active: true,
        description: "descrizione bonus vacanze",
        valid_from: "2020-07-01T00:00:00.000Z",
        valid_to: "2020-12-31T00:00:00.000Z",
        cover:
          "https://gdsit.cdn-immedia.net/2018/08/fff810d2e44464312e70071340fd92fc.jpg"
      },
      {
        id_type: 2,
        name: "Bonus che non esiste",
        is_active: false,
        description: "descrizione bonus che non esiste",
        valid_from: "2020-05-25T00:00:00.000Z",
        valid_to: "2020-06-01T00:00:00.000Z",
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

// tslint:disable-next-line: no-let
let idActivationBonus: string | undefined;
// Get all IDs of the bonus activations requested by
// the authenticated user or by any between his family member
bonusVacanze.get(`/activations`, (_, res) => {
  fromNullable(idActivationBonus).foldL(
    () => {
      // No activation found.
      res.sendStatus(404);
    },
    // List of bonus activations ID activated or consumed by the authenticated user
    // or by any between his family members (former and actual)
    () => res.json({ items: [{ id: idActivationBonus, is_applicant: true }] })
  );
});

const activeBonus = {
  applicant_fiscal_code: "SPNDNL80R11C522K",
  code: "MYSECRETCODE",
  qr_code: [
    {
      mime_type: "svg+xml",
      base64_content: qrCodeBonusVacanzeSvg
    },
    {
      mime_type: "image/png",
      base64_content: qrCodeBonusVacanzePng
    }
  ],
  max_amount: 50000,
  max_tax_benefit: 3000,
  updated_at: "2020-07-04T12:20:00.000Z",
  status: BonusStatusEnum.ACTIVE
};

bonusVacanze.get(`/activations/:bonus_id`, (_, res) => {
  fromNullable(idActivationBonus).foldL(
    () => {
      // No active bonus found.
      res.sendStatus(404);
    },
    // List of bonus activations ID activated or consumed by the authenticated user
    // or by any between his family members (former and actual)
    () => res.json({ ...activeBonus, id: idActivationBonus })
  );
});

// Start bonus activation request procedure
bonusVacanze.post(`/activations`, (_, res) => {
  // if there is no previous activation -> Request accepted -> send back the created id
  fromNullable(idActivationBonus).foldL(
    () => {
      idActivationBonus = uuidv4();
      res.status(202).json({ id: idActivationBonus });
    },
    // Cannot activate a new bonus because another bonus related to this user was found.
    () => res.sendStatus(409)
  );
});

// tslint:disable-next-line: no-let
let idEligibilityRequest: string | undefined;
// tslint:disable-next-line: no-let
let firstRequestTime = 0;
const responseIseeAfter = 18 as Second;
// Get eligibility (ISEE) check information for user's bonus

// since all these apis implements a specific flow, if you want re-run it
// some vars must be cleaned
export const resetBonusVacanze = () => {
  idEligibilityRequest = undefined;
  firstRequestTime = 0;
  idActivationBonus = undefined;
};

// Start bonus eligibility check (ISEE)
bonusVacanze.post("/eligibility", (_, res) => {
  if (idEligibilityRequest) {
    // a task already exists because it has been requested
    // return conflict status
    res.status(409).json({ id: idEligibilityRequest });
    return;
  }
  firstRequestTime = new Date().getTime();
  idEligibilityRequest = uuidv4();
  // first time return the id of the created task -> request accepted
  res.status(202).json({ id: idEligibilityRequest });
});

bonusVacanze.get("/eligibility", (_, res) => {
  const eligibilityCheck = {
    family_members: [
      {
        name: "Mario",
        surname: "Rossi",
        fiscal_code: "EFCMZZ80A12L720R"
      },
      {
        name: "Giulia",
        surname: "Rossi",
        fiscal_code: "CDCMQQ81A12L721R"
      },
      {
        name: "Piero",
        surname: "Rossi",
        fiscal_code: "ABCMYY82A12L722R"
      }
    ],
    max_amount: 50000,
    max_tax_benefit: 3000
  };
  // no task created, not-found
  if (idEligibilityRequest === undefined) {
    res.sendStatus(404);
    return;
  }
  const elapsedTime = (new Date().getTime() - firstRequestTime) / 1000;
  // if elapsedTime is less than responseIseeAfter return pending status
  // first time return the id of the created task
  if (idEligibilityRequest && elapsedTime < responseIseeAfter) {
    // request accepted, return the task id
    res.status(202).json({ id: idEligibilityRequest });
    return;
  }
  enum EligibilityCheckStatusEnum {
    "USER_NOT_FOUND" = "USER_NOT_FOUND",
    "INELIGIBLE" = "INELIGIBLE",
    "ISEE_NOT_FOUND" = "ISEE_NOT_FOUND",
    "ELIGIBLE" = "ELIGIBLE"
  }
  // possible states
  // - USER_NOT_FOUND    User not found in INPS database
  // - ISEE_NOT_FOUND    User found but there's no ISEE data
  // - ELIGIBILE         The user is eligible for the bonus
  // - INELIGIBLE        The user is not eligible for the bonus
  // Request processed
  // TODO we should mock also the ERROR case
  res.status(200).json({
    ...eligibilityCheck,
    id: idEligibilityRequest,
    status: EligibilityCheckStatusEnum.ELIGIBLE
  });
});

// Cancel bonus eligibility check procedure (avoids sending a push notification when done)
bonusVacanze.delete("/eligibility", (_, res) => {
  if (idEligibilityRequest) {
    // Request canceled.
    res.status(200).json({ id: idEligibilityRequest });
    return;
  }
  // not found
  res.status(404);
});
