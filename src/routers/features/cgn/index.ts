import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import { Card } from "../../../../generated/definitions/cgn/Card";
import { StatusEnum as ActivatedStatusEnum } from "../../../../generated/definitions/cgn/CardActivated";
import {
  CardPending,
  StatusEnum as PendingStatusEnum
} from "../../../../generated/definitions/cgn/CardPending";
import { StatusEnum } from "../../../../generated/definitions/cgn/CgnActivationDetail";
// tslint:disable-next-line:no-commented-code
// import { StatusEnum as CanceledStatusEnum } from "../../../../generated/definitions/cgn/CgnCanceledStatus";
// import { StatusEnum as RevokedStatusEnum } from "../../../../generated/definitions/cgn/CgnRevokedStatus";
import { addHandler } from "../../../payloads/response";
import { getRandomStringId } from "../../../utils/id";
import { addApiV1Prefix } from "../../../utils/strings";

export const cgnRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/cgn${path}`);

// tslint:disable-next-line: no-let
let idActivationCgn: string | undefined;
// tslint:disable-next-line: no-let
let firstCgnActivationRequestTime = 0;

// tslint:disable-next-line: no-let
let currentCGN: Card = {
  status: PendingStatusEnum.PENDING
};
// Start bonus activation request procedure
// 201 -> Request created.
// 202 -> Processing request.
// 401 -> Bearer token null or expired.
// 409 -> Cannot activate the user's cgn because another updateCgn request was found for this user or it is already active.
// 403 -> Cannot activate a new CGN because the user is ineligible to get the CGN.
addHandler(cgnRouter, "post", addPrefix("/activation"), (_, res) => {
  // if there is no previous activation -> Request created -> send back the created id
  fromNullable(idActivationCgn).foldL(
    () => {
      idActivationCgn = getRandomStringId();
      firstCgnActivationRequestTime = new Date().getTime();
      res.status(201).json({ id: idActivationCgn });
    },
    // Cannot activate a new bonus because another bonus related to this user was found.
    () =>
      CardPending.is(currentCGN)
        ? res.status(202).json({ id: idActivationCgn })
        : res.sendStatus(409)
  );
});

/**
 * Get the CGN activation status
 * Used by the app as polling during the activation workflow
 * status code 200 returns the current status of the job
 * status 404 means no activation job has been found
 */
addHandler(cgnRouter, "get", addPrefix("/activation"), (_, res) =>
  // if there is no previous activation -> Request created -> send back the created id
  fromNullable(idActivationCgn).foldL(
    // No CGN was found return a 404
    () => res.sendStatus(404),
    id => {
      const response = {
        instance_id: id,
        status: StatusEnum.COMPLETED
      };
      return res.status(200).json(response);
    }
  )
);

// Start activation check
// 200 -> CGN current Status
// 404 -> no CGN found
addHandler(cgnRouter, "get", addPrefix("/status"), (_, res) => {
  if (firstCgnActivationRequestTime > 0) {
    currentCGN = {
      status: ActivatedStatusEnum.ACTIVATED,
      activation_date: new Date(firstCgnActivationRequestTime),
      expiration_date: new Date("2050-05-10")
    };
    res.status(200).json(currentCGN);
  } else {
    res.sendStatus(404);
  }
});

export const resetCgn = () => {
  idActivationCgn = undefined;
  firstCgnActivationRequestTime = 0;
  currentCGN = {
    status: PendingStatusEnum.PENDING
  };
};
