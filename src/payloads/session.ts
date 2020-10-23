import { PublicSession } from "../../generated/definitions/backend/PublicSession";
import { SpidLevel } from "../../generated/definitions/backend/SpidLevel";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

export const walletToken = "ZXCVBNM098876541";
export const myPortalToken = "ZXCVBNM098876542";
export const bpdToken = "ZXCVBNM098876543";

export const customSession: PublicSession = {
  spidLevel: "https://www.spid.gov.it/SpidL2" as SpidLevel,
  walletToken,
  myPortalToken,
  bpdToken
};
export const session: IOResponse<PublicSession> = {
  payload: validatePayload(PublicSession, customSession),
  isJson: true
};

export const session404: IOResponse<PublicSession> = {
  payload: validatePayload(PublicSession, customSession),
  isJson: false,
  status: 404
};
