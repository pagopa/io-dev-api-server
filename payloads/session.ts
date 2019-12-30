import { validatePayload } from "../utils/validator";
import { PublicSession } from "../generated/definitions/backend/PublicSession";
import { IOResponse } from "./response";

export const walletToken = "ZXCVBNM098876543";

export const customSession = {
  spidLevel: "https://www.spid.gov.it/SpidL2",
  walletToken
};

export const session: IOResponse = {
  payload: validatePayload(PublicSession, customSession),
  isJson: true
};
