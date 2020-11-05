import { Router } from "express";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { UserDataProcessing } from "../../generated/definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../generated/definitions/backend/UserDataProcessingChoice";
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

// installHandler(
//   profileRouter,
//   "delete",
//   addApiV1Prefix("/user-data-processing/:choice"),
//   req => {
//     const choice = req.params.choice as UserDataProcessingChoiceEnum;

//     if (choice === UserDataProcessingChoiceEnum.DOWNLOAD) {
//       return conflict;
//     }
//     if (userChoices[choice] !== undefined) {
//       return { payload: userChoices[choice] };
//     }
//     const data: UserDataProcessing = {
//       choice,
//       status: UserDataProcessingStatusEnum.PENDING,
//       version: 1
//     };
//     userChoices = {
//       DOWNLOAD: choice === "DOWNLOAD" ? data : userChoices.DOWNLOAD,
//       DELETE: choice === "DELETE" ? data : userChoices.DELETE
//     };
//     return { payload: userChoices[choice] };
//   }
// );

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
