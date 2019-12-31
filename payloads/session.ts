import { PublicSession } from "../generated/definitions/backend/PublicSession";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

export const walletToken = "ZXCVBNM098876543";

export const customSession = {
  spidLevel: "https://www.spid.gov.it/SpidL2",
  walletToken
};
export const session: IOResponse<PublicSession> = {
  payload: validatePayload(PublicSession, customSession),
  isJson: true
};
