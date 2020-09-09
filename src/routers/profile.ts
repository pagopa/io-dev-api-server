import { Router } from "express";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { UserMetadata } from "../../generated/definitions/backend/UserMetadata";
import { fiscalCode } from "../global";
import { getProfile } from "../payloads/profile";
import { installHandler } from "../payloads/response";
import { getSuccessResponse } from "../payloads/success";
import { userMetadata } from "../payloads/userMetadata";
import { validatePayload } from "../utils/validator";
import { basePath } from "../../generated/definitions/backend_api_paths";
const currentProfile = getProfile(fiscalCode);
// tslint:disable-next-line: no-let
let profilePayload = currentProfile.payload;
export const profileRouter = Router();

const appendPrefix = (path: string) => `${basePath}${path}`;

installHandler(
  profileRouter,
  "put",
  appendPrefix("/installations/:installationID"),
  () => getSuccessResponse()
);
installHandler(
  profileRouter,
  "get",
  appendPrefix("/profile"),
  () => ({ payload: profilePayload }),
  InitializedProfile
);
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
