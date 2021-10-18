import * as faker from "faker";
import { PublicSession } from "../../generated/definitions/backend/PublicSession";
import { SpidLevel } from "../../generated/definitions/backend/SpidLevel";
import { getRandomValue } from "../utils/random";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

const getToken = (defaultValue: string) =>
  getRandomValue(
    defaultValue,
    faker.random.alphaNumeric(15).toUpperCase(),
    "global"
  );

export const customSession: PublicSession = {
  spidLevel: "https://www.spid.gov.it/SpidL2" as SpidLevel,
  walletToken: getToken("AAAAAAAAAAAAA1"),
  myPortalToken: getToken("AAAAAAAAAAAAA2"),
  bpdToken: getToken("AAAAAAAAAAAAA3")
};
export const session: IOResponse<PublicSession> = {
  payload: validatePayload(PublicSession, customSession),
  isJson: true
};
