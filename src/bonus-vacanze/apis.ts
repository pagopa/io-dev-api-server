import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import { Second } from "italia-ts-commons/lib/units";
import { uuidv4 } from "../utils/strings";
import { availableBonuses } from "./payloads/availableBonuses";
import { activeBonus } from "./payloads/bonus";
import { eligibilityCheckSuccessEligible } from "./payloads/eligibility";
export const bonusVacanze = Router();

// get the list of all available bonus types
bonusVacanze.get("/", (_, res) => {
  res.json(availableBonuses);
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

// tslint:disable-next-line: no-let
let firstBonusActivationRequestTime = 0;
const responseBonusActivationAfter = 8 as Second;
// 202 -> Processing request.
// 200 -> Bonus activation details.
// 404 -> No bonus found.
bonusVacanze.get(`/activations/:bonus_id`, (req, res) => {
  // no task created, not-found
  if (idActivationBonus === undefined) {
    res.sendStatus(404);
    return;
  }
  const elapsedTime =
    (new Date().getTime() - firstBonusActivationRequestTime) / 1000;
  if (elapsedTime < responseBonusActivationAfter) {
    // request accepted, return the task id
    res.status(202).json({ id: idActivationBonus });
    return;
  }
  res.status(200).json({ ...activeBonus, id: req.params.bonus_id });
});

// Start bonus activation request procedure
// 202 -> Request accepted.
// 409 -> Cannot activate a new bonus because another bonus related to this user was found.
// 403 -> Cannot activate a new bonus because the eligibility data has expired.
// The user must re-initiate the eligibility procedure to refresh her data
// and retry to activate the bonus within 24h since her got the result.
bonusVacanze.post(`/activations`, (_, res) => {
  // if there is no previous activation -> Request accepted -> send back the created id
  fromNullable(idActivationBonus).foldL(
    () => {
      idActivationBonus = uuidv4();
      firstBonusActivationRequestTime = new Date().getTime();
      res.status(202).json({ id: idActivationBonus });
    },
    // Cannot activate a new bonus because another bonus related to this user was found.
    () => res.sendStatus(409)
  );
});

// tslint:disable-next-line: no-let
let idEligibilityRequest: string | undefined;
// tslint:disable-next-line: no-let
let firstIseeRequestTime = 0;
const responseIseeAfter = 3 as Second;
// Get eligibility (ISEE) check information for user's bonus

// since all these apis implements a specific flow, if you want re-run it
// some vars must be cleaned
export const resetBonusVacanze = () => {
  idEligibilityRequest = undefined;
  firstIseeRequestTime = 0;
  idActivationBonus = undefined;
  firstBonusActivationRequestTime = 0;
};

// Start bonus eligibility check (ISEE)
bonusVacanze.post("/eligibility", (_, res) => {
  if (idEligibilityRequest) {
    // a task already exists because it has been requested
    // return conflict status
    res.status(409).json({ id: idEligibilityRequest });
    return;
  }
  firstIseeRequestTime = new Date().getTime();
  idEligibilityRequest = uuidv4();
  // first time return the id of the created task -> request accepted
  res.status(202).json({ id: idEligibilityRequest });
});

bonusVacanze.get("/eligibility", (_, res) => {
  // no task created, not-found
  if (idEligibilityRequest === undefined) {
    res.sendStatus(404);
    return;
  }
  const elapsedTime = (new Date().getTime() - firstIseeRequestTime) / 1000;
  // if elapsedTime is less than responseIseeAfter return pending status
  // first time return the id of the created task
  if (idEligibilityRequest && elapsedTime < responseIseeAfter) {
    // request accepted, return the task id
    res.status(202).json({ id: idEligibilityRequest });
    return;
  }
  // Request processed
  // success and eligible -> eligibilityCheckSuccessEligible
  // success and ineligible -> eligibilityCheckSuccessIneligible
  // failure (multiple error avaible, see ErrorEnum)-> eligibilityCheckFailure
  res.status(200).json(eligibilityCheckSuccessEligible);
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
