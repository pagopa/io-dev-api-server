import { NonNegativeInteger } from "@pagopa/ts-commons/lib/numbers";
import { Router } from "express";
import faker from "faker/locale/it";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { Millisecond } from "italia-ts-commons/lib/units";
import { ServiceId } from "../../../../generated/definitions/backend/ServiceId";
import { Card } from "../../../../generated/definitions/cgn/Card";
import { StatusEnum as ActivatedStatusEnum } from "../../../../generated/definitions/cgn/CardActivated";
import {
  CardPending,
  StatusEnum as PendingStatusEnum
} from "../../../../generated/definitions/cgn/CardPending";
import { CcdbNumber } from "../../../../generated/definitions/cgn/CcdbNumber";
import { StatusEnum } from "../../../../generated/definitions/cgn/CgnActivationDetail";
import {
  EycaActivationDetail,
  StatusEnum as EycaStatusEnum
} from "../../../../generated/definitions/cgn/EycaActivationDetail";
import { EycaCard } from "../../../../generated/definitions/cgn/EycaCard";
import { Otp } from "../../../../generated/definitions/cgn/Otp";
import { genRandomBonusCode } from "../../../payloads/features/bonus-vacanze/bonus";
import { addHandler } from "../../../payloads/response";
import { cgnServiceId } from "../../../payloads/services/special";
import { getRandomStringId } from "../../../utils/id";
import { getRandomValue } from "../../../utils/random";
import { addApiV1Prefix } from "../../../utils/strings";
import { servicesPreferences } from "../../service";

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

// tslint:disable-next-line: no-let
let idActivationEyca: string | undefined;
// tslint:disable-next-line: no-let
let firstEycaActivationRequestTime = 0;

// tslint:disable-next-line: no-let
let currentEyca: EycaCard | undefined;

// tslint:disable-next-line: no-let
let eycaActivationStatus: EycaActivationDetail = {
  status: EycaStatusEnum.UNKNOWN
};

const eycaCardNumber = "W413-K096-O814-Z223";
const activationTime = 16000 as Millisecond;

export const isCgnActivated = () => firstCgnActivationRequestTime > 0;

// Start bonus activation request procedure
// 201 -> Request created.
// 202 -> Processing request.
// 401 -> Bearer token null or expired.
// 409 -> Cannot activate the user's cgn because another updateCgn request was found for this user or it is already active.
// 403 -> Cannot activate a new CGN because the user is ineligible to get the CGN.
addHandler(cgnRouter, "post", addPrefix("/activation"), (_, res) => {
  // if there is no previous activation -> Request created -> send back the created id
  pipe(
    O.fromNullable(idActivationCgn),
    O.fold(
      () => {
        idActivationCgn = getRandomStringId();
        firstCgnActivationRequestTime = new Date().getTime();
        idActivationEyca = getRandomStringId();
        firstEycaActivationRequestTime = new Date().getTime();
        res.status(201).json({ id: idActivationCgn });
      },
      // Cannot activate a new bonus because another bonus related to this user was found.
      () =>
        CardPending.is(currentCGN)
          ? res.status(202).json({ id: idActivationCgn })
          : res.sendStatus(409)
    )
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
  pipe(
    O.fromNullable(idActivationCgn),
    O.fold(
      // No CGN was found return a 404
      () => res.sendStatus(404),
      id => {
        const response = {
          instance_id: { id },
          status: StatusEnum.COMPLETED
        };
        const currentPreference = servicesPreferences.get(
          cgnServiceId as ServiceId
        );

        const increasedSettingsVersion = (((currentPreference?.settings_version as number) ??
          -1) + 1) as NonNegativeInteger;
        servicesPreferences.set(cgnServiceId as ServiceId, {
          is_inbox_enabled: true,
          is_email_enabled:
            currentPreference?.is_email_enabled ??
            getRandomValue(false, faker.datatype.boolean(), "services"),
          is_webhook_enabled: faker.datatype.boolean(),
          settings_version: increasedSettingsVersion
        });

        return res.status(200).json(response);
      }
    )
  )
);

// Start activation check
// 200 -> CGN current Status
// 404 -> no CGN found
addHandler(cgnRouter, "get", addPrefix("/status"), (_, res) => {
  if (isCgnActivated()) {
    currentCGN = {
      status: ActivatedStatusEnum.ACTIVATED,
      activation_date: new Date(firstCgnActivationRequestTime),
      expiration_date: faker.date.future()
    };
    res.status(200).json(currentCGN);
  } else {
    res.sendStatus(404);
  }
});

// Start bonus activation request procedure
// 201 -> Request created.
// 202 -> Processing request.
// 401 -> Bearer token null or expired.
// 409 -> Cannot activate the user's EYCA because another request was found for this user or it is already active.
// 403 -> Cannot activate an EYCA card because the user is ineligible to get the EYCA.
addHandler(cgnRouter, "post", addPrefix("/eyca/activation"), (_, res) => {
  // if there is no previous activation -> Request created -> send back the created id
  pipe(
    O.fromNullable(idActivationEyca),
    O.fold(
      () => {
        idActivationEyca = getRandomStringId();
        firstEycaActivationRequestTime = new Date().getTime();
        eycaActivationStatus = { status: StatusEnum.RUNNING };
        res.status(201).json({ id: idActivationEyca });
      },
      // Cannot activate a new bonus because another bonus related to this user was found.
      () =>
        CardPending.is(currentEyca)
          ? res.status(202).json({ id: idActivationCgn })
          : res.sendStatus(409)
    )
  );
});

/**
 * Get the EYCA activation status
 * Used by the app as polling during the activation workflow
 * status code 200 returns the current status of the job
 * status 404 means no activation job has been found
 */
addHandler(cgnRouter, "get", addPrefix("/eyca/activation"), (_, res) =>
  // if there is no previous activation -> Request created -> send back the created id
  pipe(
    O.fromNullable(idActivationEyca),
    O.fold(
      // No CGN was found return a 404
      () => res.sendStatus(404),
      __ => {
        const now = new Date().getTime();
        if (now - firstEycaActivationRequestTime < activationTime) {
          return res.status(200).json({
            status: StatusEnum.RUNNING
          });
        }
        eycaActivationStatus = {
          status: StatusEnum.COMPLETED
        };
        currentEyca = {
          status: PendingStatusEnum.PENDING
        };
        return res.status(200).json(eycaActivationStatus);
      }
    )
  )
);

// Eyca details
// 200 -> EYCA current Status
// 404 -> no EYCA found
// 403 -> user's not EYCA Eligible
// 409 -> Error encountered but user's EYCA Eligible
addHandler(cgnRouter, "get", addPrefix("/eyca/status"), (_, res) => {
  if (firstEycaActivationRequestTime > 0 && idActivationEyca) {
    currentEyca = {
      status: ActivatedStatusEnum.ACTIVATED,
      card_number: eycaCardNumber as CcdbNumber,
      activation_date: new Date(
        firstCgnActivationRequestTime > firstEycaActivationRequestTime
          ? firstCgnActivationRequestTime
          : firstEycaActivationRequestTime
      ),
      expiration_date: faker.date.future()
    };
    res.status(200).json(currentEyca);
  } else {
    res.sendStatus(409);
  }
});

addHandler(cgnRouter, "post", addPrefix("/otp"), (_, res) => {
  const now = new Date().getTime();
  const secondsInTheFuture = 30;
  const otp = {
    code: genRandomBonusCode(11),
    expires_at: new Date(now + secondsInTheFuture * 1000).toISOString(), // secondsInTheFuture seconds in the future
    ttl: secondsInTheFuture
  };
  pipe(
    Otp.decode(otp),
    E.fold(
      e => res.status(500).send(readableReport(e)),
      v => res.json(v)
    )
  );
});

addHandler(cgnRouter, "post", addPrefix("/delete"), (_, res) => {
  // if there is no previous activation -> Request created -> send back the created id
  pipe(
    O.fromNullable(idActivationCgn),
    O.fold(
      () => {
        res.sendStatus(403);
      },
      () => {
        if (CardPending.is(currentCGN)) {
          res.sendStatus(409);
          return;
        }
        resetCgn();
        res.status(201).json({ id: getRandomStringId() });
      }
    )
  );
});

export const resetCgn = () => {
  idActivationCgn = undefined;
  currentEyca = undefined;
  firstCgnActivationRequestTime = 0;
  currentCGN = {
    status: PendingStatusEnum.PENDING
  };
  idActivationEyca = undefined;
  firstEycaActivationRequestTime = 0;
  eycaActivationStatus = {
    status: EycaStatusEnum.UNKNOWN
  };
};
