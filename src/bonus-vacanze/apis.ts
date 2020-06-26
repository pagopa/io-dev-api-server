import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import { Second } from "italia-ts-commons/lib/units";
import { sendFile } from "../server";
import { uuidv4 } from "../utils/strings";
import { activeBonus, genRandomBonusCode } from "./payloads/bonus";
import {
  eligibilityCheckSuccessEligible,
  eligibilityCheckSuccessIneligible,
  eligibilityCheckFailure,
  eligibilityCheckConflict
} from "./payloads/eligibility";
import { range } from "fp-ts/lib/Array";
export const bonusVacanze = Router();

bonusVacanze.get("/definitions", (_, res) => {
  sendFile("assets/bonus-vacanze/specs.yaml", res);
});

bonusVacanze.get("/definitions_functions", (_, res) => {
  sendFile("assets/bonus-vacanze/specs_functions.yaml", res);
});

// tslint:disable-next-line: no-let
let idActivationBonus: string | undefined;
const aLotOfBonus = range(1, 3).map(_ => ({
  ...activeBonus,
  id: genRandomBonusCode()
}));
// Get all IDs of the bonus activations requested by
// the authenticated user or by any between his family member
bonusVacanze.get(`/activations`, (_, res) => {
  res.json({
    items: aLotOfBonus.map(b => ({ id: b.id, is_applicant: true }))
  });
  return;
  fromNullable(idActivationBonus).foldL(
    () => {
      // No activation found.
      //res.sendStatus(404);
      // if you want to return a list of bonus comment the line above and uncomment the line below

      res.json({
        items: aLotOfBonus.map(b => ({ id: b.id, is_applicant: true }))
      });
    },

    // List of bonus activations ID activated or consumed by the authenticated user
    // or by any between his family members (former and actual)
    () => res.json({ items: [{ id: idActivationBonus, is_applicant: true }] })
  );
});

// tslint:disable-next-line: no-let
let firstBonusActivationRequestTime = 0;
const responseBonusActivationAfter = 3 as Second;
// 202 -> Processing request.
// 200 -> Bonus activation details.
// 404 -> No bonus found.
bonusVacanze.get(`/activations/:bonus_id`, (req, res) => {
  res.status(200).json(aLotOfBonus[0]);
  const bonus = aLotOfBonus.find(b => b.id === req.params.bonus_id);
  if (bonus) {
    res.status(200).json(bonus);
  }
  // use one of these constants to simulate different scenario
  // - activeBonus
  // - redeemedBonus
  // no task created, not-found
  if (idActivationBonus === undefined) {
    res.sendStatus(404);
    return;
  }
  const elapsedTime =
    (new Date().getTime() - firstBonusActivationRequestTime) / 1000;
  if (elapsedTime < responseBonusActivationAfter) {
    // request accepted, return the task id
    res.status(202).json({ id: activeBonus.id });
    return;
  }
  res.status(200).json(activeBonus);
});

// Start bonus activation request procedure
// 201 -> Request created.
// 201 -> Processing request.
// 409 -> Cannot activate a new bonus because another bonus related to this user was found.
// 403 -> Cannot activate a new bonus because the eligibility data has expired.
// The user must re-initiate the eligibility procedure to refresh her data
// and retry to activate the bonus within 24h since her got the result.
bonusVacanze.post(`/activations`, (_, res) => {
  // if there is no previous activation -> Request created -> send back the created id
  fromNullable(idActivationBonus).foldL(
    () => {
      idActivationBonus = activeBonus.id;
      firstBonusActivationRequestTime = new Date().getTime();
      res.status(201).json({ id: idActivationBonus });
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

// Start bonus eligibility check (ISEE)
// 201 -> created
// 202 -> request processing
// 409 -> pending request
// 403 -> there's already an active bonus related to this user
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
  res.status(201).json({ id: idEligibilityRequest });
});

// Get eligibility (ISEE) check information for user's bonus
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
  // use these const to simulate different scenarios
  // - success and eligible -> eligibilityCheckSuccessEligible
  // - success and ineligible -> eligibilityCheckSuccessIneligible
  // - conflict -> eligibilityCheckConflict (Eligibility check succeeded but there's already a bonus found for this set of family members.)
  // - failure (multiple error avaible, see ErrorEnum)-> eligibilityCheckFailure
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

// since all these apis implements a specific flow, if you want re-run it
// some vars must be cleaned
export const resetBonusVacanze = () => {
  idEligibilityRequest = undefined;
  firstIseeRequestTime = 0;
  idActivationBonus = undefined;
  firstBonusActivationRequestTime = 0;
};
