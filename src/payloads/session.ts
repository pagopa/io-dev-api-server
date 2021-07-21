import * as faker from "faker";
import { PublicSession } from "../../generated/definitions/backend/PublicSession";
import { SpidLevel } from "../../generated/definitions/backend/SpidLevel";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

export const customSession: PublicSession = {
  spidLevel: "https://www.spid.gov.it/SpidL2" as SpidLevel,
  walletToken: faker.random.alphaNumeric(15).toUpperCase(),
  myPortalToken: faker.random.alphaNumeric(15).toUpperCase(),
  bpdToken: faker.random.alphaNumeric(15).toUpperCase()
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
