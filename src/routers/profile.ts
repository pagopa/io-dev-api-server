import { Router } from "express";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { UserDataProcessing } from "../../generated/definitions/backend/UserDataProcessing";
import {
  UserDataProcessingChoice,
  UserDataProcessingChoiceEnum
} from "../../generated/definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingChoiceRequest } from "../../generated/definitions/backend/UserDataProcessingChoiceRequest";
import { UserDataProcessingStatusEnum } from "../../generated/definitions/backend/UserDataProcessingStatus";
import { UserMetadata } from "../../generated/definitions/backend/UserMetadata";
import { fiscalCode } from "../global";
import { conflict, getProblemJson } from "../payloads/error";
import { getProfile } from "../payloads/profile";
import { installCustomHandler, installHandler } from "../payloads/response";
import { getSuccessResponse } from "../payloads/success";
import { userMetadata } from "../payloads/userMetadata";
import { addApiV1Prefix } from "../utils/strings";
import { validatePayload } from "../utils/validator";
import { fromNullable } from "fp-ts/lib/Option";
import { undefined as undefinedType } from "io-ts";
const profile = getProfile(fiscalCode);
// tslint:disable-next-line: no-let
let profilePayload = { ...profile.payload };
// define user UserDataProcessing (download / delete)
// to handle and remember user choice
type UserDeleteDownloadData = {
  [key in keyof typeof UserDataProcessingChoiceEnum]:
    | UserDataProcessing
    | undefined;
};
const initialUserChoice: UserDeleteDownloadData = {
  DOWNLOAD: undefined,
  DELETE: undefined
};
// tslint:disable-next-line: no-let
let userChoices = initialUserChoice;

export const profileRouter = Router();

// update installationID (usefull information to target device using push notification)
installHandler(
  profileRouter,
  "put",
  addApiV1Prefix("/installations/:installationID"),
  () => getSuccessResponse()
);

// get profile
installHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/profile"),
  () => ({ payload: profilePayload }),
  InitializedProfile
);

// update profile
installHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/profile"),
  req => {
    // profile is merged with the one coming from request.
    // furthermore this profile's version is increased by 1
    const clientProfileIncreased = {
      ...req.body,
      version: parseInt(req.body.version, 10) + 1
    };
    profilePayload = {
      ...profilePayload,
      ...clientProfileIncreased
    };
    return { payload: profilePayload };
  },
  InitializedProfile
);

// User metadata

installHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/user-metadata"),
  () => userMetadata,
  UserMetadata
);
installHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/user-metadata"),
  req => {
    // simply validate and return the received user-metadata
    const payload = validatePayload(UserMetadata, req.body);
    return { payload };
  },
  UserMetadata
);

// User data processing (DOWNLOAD / DELETE)
installHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/user-data-processing/:choice"),
  req => {
    const choice = req.params.choice as UserDataProcessingChoiceEnum;
    if (userChoices[choice] === undefined) {
      return getProblemJson(404);
    }
    return { payload: userChoices[choice] };
  }
);
installHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/user-data-processing"),
  req => {
    const payload = validatePayload(UserDataProcessingChoiceRequest, req.body);
    const choice = payload.choice;
    if (userChoices[choice] !== undefined) {
      return { payload: userChoices[choice] };
    }
    const data: UserDataProcessing = {
      choice,
      status: UserDataProcessingStatusEnum.PENDING,
      version: 1
    };
    userChoices = {
      DOWNLOAD: choice === "DOWNLOAD" ? data : userChoices.DOWNLOAD,
      DELETE: choice === "DELETE" ? data : userChoices.DELETE
    };
    return { payload: userChoices[choice] };
  }
);

installCustomHandler(
  profileRouter,
  "delete",
  addApiV1Prefix("/user-data-processing/:choice"),
  (req, res) => {
    // try to decode the request param

    res.status(202).send(undefinedType);
    const maybeChoice = UserDataProcessingChoice.decode(req.params.choice);

    if (maybeChoice.isLeft()) {
      // the given param is not a valid UserDataProcessingChoice
      // send invalid request
      res.sendStatus(400);
      return;
    }

    const choice = maybeChoice.value;
    // The abort function is managed only for the DELETE
    if (choice === UserDataProcessingChoiceEnum.DOWNLOAD) {
      res.sendStatus(409);
    }

    res.sendStatus(
      fromNullable(userChoices[choice]).fold(409, c =>
        c.status !== UserDataProcessingStatusEnum.PENDING ? 409 : 202
      )
    );
  }
);

// Email validation
// return positive feedback on request to receive a new email message to verify his/her email
installCustomHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/email-validation-process"),
  (_, res) => {
    res.sendStatus(202);
  }
);

// reset function
export const resetProfile = () => {
  userChoices = initialUserChoice;
  profilePayload = { ...profile.payload };
};
