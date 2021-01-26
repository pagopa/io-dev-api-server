import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import { StatusEnum as ActivatedStatusEnum } from "../../../../generated/definitions/cgn/CgnActivatedStatus";
import {
  CgnPendingStatus,
  StatusEnum as PendingStatusEnum
} from "../../../../generated/definitions/cgn/CgnPendingStatus";
// tslint:disable-next-line:no-commented-code
// import { StatusEnum as CanceledStatusEnum } from "../../../../generated/definitions/cgn/CgnCanceledStatus";
// import { StatusEnum as RevokedStatusEnum } from "../../../../generated/definitions/cgn/CgnRevokedStatus";
import { CgnStatus } from "../../../../generated/definitions/cgn/CgnStatus";
import { addHandler } from "../../../payloads/response";
import { getRandomStringId } from "../../../utils/id";
import { addApiV1Prefix } from "../../../utils/strings";
import { bonusVacanze } from "../bonus-vacanze";

export const cgnRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/cgn${path}`);

// tslint:disable-next-line: no-let
let idActivationCgn: string | undefined;
// tslint:disable-next-line: no-let
let firstCgnActivationRequestTime = 0;

// tslint:disable-next-line: no-let
let currentCGN: CgnStatus = {
  status: PendingStatusEnum.PENDING
};
// Start bonus activation request procedure
// 201 -> Request created.
// 202 -> Processing request.
// 401 -> Bearer token null or expired.
// 409 -> Cannot activate the user's cgn because another updateCgn request was found for this user or it is already active.
// 403 -> Cannot activate a new CGN because the user is ineligible to get the CGN.
addHandler(cgnRouter, "post", addPrefix("/activations"), (_, res) => {
  // if there is no previous activation -> Request created -> send back the created id
  fromNullable(idActivationCgn).foldL(
    () => {
      idActivationCgn = getRandomStringId();
      firstCgnActivationRequestTime = new Date().getTime();
      res.status(201).json({ id: idActivationCgn });
    },
    // Cannot activate a new bonus because another bonus related to this user was found.
    () =>
      CgnPendingStatus.is(currentCGN)
        ? res.status(202).json({ id: idActivationCgn })
        : res.sendStatus(409)
  );
});

// Start activation check
// 200 -> CGN current Status
// 404 -> no CGN found
addHandler(bonusVacanze, "get", addPrefix("/status"), (_, res) => {
  currentCGN = {
    status: ActivatedStatusEnum.ACTIVATED,
    activation_date: new Date(firstCgnActivationRequestTime),
    expiration_date: new Date("2050-05-10")
  };
  // first time return the id of the created task -> request accepted
  res.status(200).json(currentCGN);
});
