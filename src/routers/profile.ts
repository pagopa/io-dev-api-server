import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { UserMetadata } from "../../generated/definitions/backend/UserMetadata";
import { fiscalCode } from "../global";
import { getProfile } from "../payloads/profile";
import { ResponseHandler } from "../payloads/response";
import { getSuccessResponse } from "../payloads/success";
import { userMetadata } from "../payloads/userMetadata";
import { validatePayload } from "../utils/validator";
// tslint:disable-next-line: no-let
let currentProfile = getProfile(fiscalCode).payload;
export const setProfileHandlers = (responseHanler: ResponseHandler) => {
  responseHanler
    .addCustomHandler("get", "/profile", _ => {
      //return getProblemJson(401);
      return { payload: currentProfile, isJson: true };
    })
    .addHandler("put", "/installations/:installationID", getSuccessResponse())
    .addCustomHandler("post", "/profile", req => {
      // the server profile is merged with
      // the one coming from request. Furthermore this profile's version is increased by 1
      console.log(JSON.stringify(req.body));
      const clientProfileIncresed = {
        ...req.body,
        version: parseInt(req.body.version, 10) + 1
      };
      currentProfile = validatePayload(InitializedProfile, {
        ...currentProfile,
        ...clientProfileIncresed
      });
      return {
        payload: currentProfile,
        isJson: true
      };
    })
    .addHandler("get", "/user-metadata", userMetadata)
    .addCustomHandler("post", "/user-metadata", req => {
      // simply validate and return the received user-metadata
      const payload = validatePayload(UserMetadata, req.body);
      return { payload };
    });
};
