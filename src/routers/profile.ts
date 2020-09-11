import { Router } from "express";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { UserMetadata } from "../../generated/definitions/backend/UserMetadata";
import { fiscalCode } from "../global";
import { getProfile } from "../payloads/profile";
import { installCustomHandler, installHandler } from "../payloads/response";
import { getSuccessResponse } from "../payloads/success";
import { userMetadata } from "../payloads/userMetadata";
import { validatePayload } from "../utils/validator";
import { basePath } from "../../generated/definitions/backend_api_paths";
import { UserDataProcessingChoiceEnum } from "../../generated/definitions/backend/UserDataProcessingChoice";
import { getProblemJson } from "../payloads/error";
import { UserDataProcessingChoiceRequest } from "../../generated/definitions/backend/UserDataProcessingChoiceRequest";
import { UserDataProcessing } from "../../generated/definitions/backend/UserDataProcessing";
import { UserDataProcessingStatusEnum } from "../../generated/definitions/backend/UserDataProcessingStatus";
const currentProfile = getProfile(fiscalCode);
// tslint:disable-next-line: no-let
let profilePayload = currentProfile.payload;
// define user UserDataProcessing (download / delete)
// to handle and remember user choice
type UserDeleteDownloadData = {
  [key in keyof typeof UserDataProcessingChoiceEnum]:
    | UserDataProcessing
    | undefined;
};
const initialUserChoice: UserDeleteDownloadData = {
  DOWNLOAD: undefined,
  DELETE: undefined,
};
// tslint:disable-next-line: no-let
let userChoices = initialUserChoice;

export const profileRouter = Router();
const appendPrefix = (path: string) => `${basePath}${path}`;

// update installationID (usefull information to target device using push notification)
installHandler(
  profileRouter,
  "put",
  appendPrefix("/installations/:installationID"),
  () => getSuccessResponse()
);

// get profile
installHandler(
  profileRouter,
  "get",
  appendPrefix("/profile"),
  () => ({ payload: profilePayload }),
  InitializedProfile
);

// update profile
installHandler(
  profileRouter,
  "post",
  appendPrefix("/profile"),
  (req) => {
    // profile is merged with the one coming from request.
    // furthermore this profile's version is increased by 1
    const clientProfileIncreased = {
      ...req.body,
      version: parseInt(req.body.version, 10) + 1,
    };
    profilePayload = {
      ...profilePayload,
      ...clientProfileIncreased,
    };
    return { payload: profilePayload };
  },
  InitializedProfile
);

// User metadata

installHandler(
  profileRouter,
  "get",
  appendPrefix("/user-metadata"),
  () => userMetadata,
  UserMetadata
);
installHandler(
  profileRouter,
  "post",
  appendPrefix("/user-metadata"),
  (req) => {
    // simply validate and return the received user-metadata
    const payload = validatePayload(UserMetadata, req.body);
    return { payload };
  },
  UserMetadata
);

// User data processing (DOWNLOAD / DELETE)
installHandler(profileRouter, "get", "/user-data-processing/:choice", (req) => {
  const choice = req.params.choice as UserDataProcessingChoiceEnum;
  if (userChoices[choice] === undefined) {
    return getProblemJson(404);
  }
  return { payload: userChoices[choice] };
});
installHandler(profileRouter, "post", "/user-data-processing", (req) => {
  const payload = validatePayload(UserDataProcessingChoiceRequest, req.body);
  const choice = payload.choice;
  if (userChoices[choice] !== undefined) {
    return { payload: userChoices[choice] };
  }
  const data: UserDataProcessing = {
    choice,
    status: UserDataProcessingStatusEnum.PENDING,
    version: 1,
  };
  userChoices = {
    DOWNLOAD: choice === "DOWNLOAD" ? data : userChoices.DOWNLOAD,
    DELETE: choice === "DELETE" ? data : userChoices.DELETE,
  };
  return { payload: userChoices[choice] };
});

// Email validation
// return positive feedback on request to receive a new email to verify the email address
installCustomHandler(
  profileRouter,
  "post",
  "/email-validation-process",
  (_, res) => {
    res.status(202);
  }
);

// reset function
export const resetProfile = () => {
  userChoices = initialUserChoice;
};
