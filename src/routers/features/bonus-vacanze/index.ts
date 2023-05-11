import { Second } from "@pagopa/ts-commons/lib/units";
import { Router } from "express";
import { faker } from "@faker-js/faker/locale/it";
import { pipe } from "fp-ts/lib/function";
import { range } from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import { BonusActivationStatusEnum } from "../../../../generated/definitions/bonus_vacanze/BonusActivationStatus";
import {
  activeBonus,
  genRandomBonusCode
} from "../../../payloads/features/bonus-vacanze/bonus";
import {
  eligibilityCheckSuccessEligible,
  familyMembers
} from "../../../payloads/features/bonus-vacanze/eligibility";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix, uuidv4 } from "../../../utils/strings";

export const bonusVacanze = Router();

// eslint-disable-next-line: no-let
let firstIseeRequestTime = 0;
// eslint-disable-next-line: no-let
let idEligibilityRequest: string | undefined;
// server responses with the eligibility check after
const responseIseeAfter = 0 as Second;

// eslint-disable-next-line: no-let
let idActivationBonus: string | undefined;
// generate clones of activeBonus but with different id
// eslint-disable-next-line: no-let
const aLotOfBonus = range(1, faker.datatype.number({ min: 1, max: 3 })).map(
  idx => {
    faker.seed(new Date().getTime());
    const familyMembersCount = faker.datatype.number({ min: 1, max: 3 });
    const amounts: ReadonlyArray<number> = [150, 300, 500];
    return {
      ...activeBonus,
      dsu_request: {
        ...activeBonus.dsu_request,
        request_id: idx,
        family_members: faker.helpers.arrayElements(
          familyMembers,
          familyMembersCount
        ),
        max_amount: amounts[familyMembersCount - 1]
      },
      id: genRandomBonusCode(),
      status:
        idx % 2 === 0
          ? BonusActivationStatusEnum.REDEEMED
          : BonusActivationStatusEnum.ACTIVE
    };
  }
);

// since all these apis implements a specific flow, if you want re-run it
// some vars must be cleaned
export const resetBonusVacanze = () => {
  idEligibilityRequest = undefined;
  firstIseeRequestTime = 0;
  idActivationBonus = undefined;
};

const addPrefix = (path: string) => addApiV1Prefix(`/bonus/vacanze${path}`);

// Get all IDs of the bonus activations requested by
// the authenticated user or by any between his family member
addHandler(bonusVacanze, "get", addPrefix(`/activations`), (_, res) => {
  res.json({
    items: aLotOfBonus.map(b => ({ id: b.id, is_applicant: true }))
  });
});

// 202 -> Processing request.
// 200 -> Bonus activation details.
// 404 -> No bonus found.
addHandler(
  bonusVacanze,
  "get",
  addPrefix(`/activations/:bonus_id`),
  (req, res) => {
    const bonus = aLotOfBonus.find(b => b.id === req.params.bonus_id);
    if (bonus) {
      res.json(bonus);
      return;
    }
    res.sendStatus(404);
  }
);

// Start bonus activation request procedure
// 201 -> Request created.
// 201 -> Processing request.
// 409 -> Cannot activate a new bonus because another bonus related to this user was found.
// 403 -> Cannot activate a new bonus because the eligibility data has expired.
// The user must re-initiate the eligibility procedure to refresh her data
// and retry to activate the bonus within 24h since her got the result.
addHandler(bonusVacanze, "post", addPrefix("/activations"), (_, res) => {
  // if there is no previous activation -> Request created -> send back the created id
  pipe(
    O.fromNullable(idActivationBonus),
    O.fold(
      () => {
        idActivationBonus = activeBonus.id;
        res.status(201).json({ id: idActivationBonus });
      },
      // Cannot activate a new bonus because another bonus related to this user was found.
      () => res.sendStatus(409)
    )
  );
});

// Start bonus eligibility check (ISEE)
// 201 -> created
// 202 -> request processing
// 409 -> pending request
// 403 -> there's already an active bonus related to this user
// 451 -> Unavailable For Legal Reasons (underage)
addHandler(bonusVacanze, "post", addPrefix("/eligibility"), (_, res) => {
  if (idEligibilityRequest) {
    // a task already exists because it has been requested
    // return conflict status
    res.status(409).json({ id: idEligibilityRequest });
    return;
  }
  if (idActivationBonus) {
    // a bonus active already exists
    res.sendStatus(403);
    return;
  }
  firstIseeRequestTime = new Date().getTime();
  idEligibilityRequest = uuidv4();
  // first time return the id of the created task -> request accepted
  res.status(201).json({ id: idEligibilityRequest });
});

// Get eligibility (ISEE) check information for user's bonus
addHandler(bonusVacanze, "get", addPrefix("/eligibility"), (_, res) => {
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
  idEligibilityRequest = undefined;
  // Request processed
  // use these const to simulate different scenarios
  // - success and eligible -> eligibilityCheckSuccessEligible
  // - success and ineligible -> eligibilityCheckSuccessIneligible
  // - conflict -> eligibilityCheckConflict (Eligibility check succeeded but there's already a bonus found for this set of family members.)
  // - failure (multiple error available, see ErrorEnum)-> eligibilityCheckFailure
  res.status(200).json(eligibilityCheckSuccessEligible);
});
