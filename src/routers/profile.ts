import { Router } from "express";
import { fromNullable } from "fp-ts/lib/Option";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { UserDataProcessing } from "../../generated/definitions/backend/UserDataProcessing";
import {
  UserDataProcessingChoice,
  UserDataProcessingChoiceEnum
} from "../../generated/definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingChoiceRequest } from "../../generated/definitions/backend/UserDataProcessingChoiceRequest";
import { UserDataProcessingStatusEnum } from "../../generated/definitions/backend/UserDataProcessingStatus";
import { fiscalCode } from "../global";
import { getProblemJson } from "../payloads/error";
import { getProfile } from "../payloads/profile";
import { addHandler } from "../payloads/response";
import { mockUserMetadata } from "../payloads/userMetadata";
import { addApiV1Prefix } from "../utils/strings";
import { validatePayload } from "../utils/validator";

const profile = getProfile(fiscalCode);
// tslint:disable-next-line: no-let
export let currentProfile = { ...profile.payload };
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

// update installationID (useful information to target device using push notification)
addHandler(
  profileRouter,
  "put",
  addApiV1Prefix("/installations/:installationID"),
  (_, res) => res.sendStatus(200)
);

// get profile
addHandler(profileRouter, "get", addApiV1Prefix("/profile"), (_, res) =>
  res.json(currentProfile)
);

// update profile
addHandler(profileRouter, "post", addApiV1Prefix("/profile"), (req, res) => {
  // profile is merged with the one coming from request.
  // furthermore this profile's version is increased by 1
  const clientProfileIncreased = {
    ...req.body,
    version: parseInt(req.body.version, 10) + 1
  };
  currentProfile = {
    ...currentProfile,
    ...clientProfileIncreased
  };
  res.json(currentProfile);
});

// User metadata
addHandler(profileRouter, "get", addApiV1Prefix("/user-metadata"), (_, res) =>
  res.json({ ...mockUserMetadata, version: currentProfile.version })
);

addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/user-metadata"),
  (req, res) => {
    res.json(req.body);
  }
);

// User data processing (DOWNLOAD / DELETE)
addHandler(
  profileRouter,
  "get",
  addApiV1Prefix("/user-data-processing/:choice"),
  (req, res) => {
    const choice = req.params.choice as UserDataProcessingChoiceEnum;
    if (userChoices[choice] === undefined) {
      res.status(404).json(getProblemJson(404));
      return;
    }
    res.json(userChoices[choice]);
  }
);
addHandler(
  profileRouter,
  "post",
  addApiV1Prefix("/user-data-processing"),
  (req, res) => {
    const payload = validatePayload(UserDataProcessingChoiceRequest, req.body);
    const choice = payload.choice;
    if (
      userChoices[choice] !== undefined &&
      userChoices[choice]?.status !== UserDataProcessingStatusEnum.ABORTED
    ) {
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
    res.json(userChoices[choice]);
  }
);

addHandler(
  profileRouter,
  "delete",
  addApiV1Prefix("/user-data-processing/:choice"),
  (req, res) => {
    // try to decode the request param

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
      return;
    }

    const acceptedOrConflictStatus = fromNullable(userChoices[choice]).fold(
      409,
      c => (c.status !== UserDataProcessingStatusEnum.PENDING ? 409 : 202)
    );
    res.sendStatus(acceptedOrConflictStatus);

    if (acceptedOrConflictStatus === 202) {
      const data: UserDataProcessing = {
        choice,
        status: UserDataProcessingStatusEnum.ABORTED,
        version: 1
      };
      userChoices = {
        DOWNLOAD: userChoices.DOWNLOAD,
        DELETE: data
      };
    }
  }
);

// Email validation
// return positive feedback on request to receive a new email message to verify his/her email
addHandler(
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
  currentProfile = { ...profile.payload };
};
