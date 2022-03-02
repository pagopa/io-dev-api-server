import * as faker from "faker";
import { PublicSession } from "../../generated/definitions/backend/PublicSession";
import { SpidLevel } from "../../generated/definitions/backend/SpidLevel";
import { Server } from "../core/server";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

export const makeSession = (
  getRandomValue: Server["getRandomValue"]
): IOResponse<PublicSession> => {
  const getToken = (defaultValue: string) =>
    getRandomValue(defaultValue, faker.random.alphaNumeric(15).toUpperCase());

  const customSession: PublicSession = {
    spidLevel: "https://www.spid.gov.it/SpidL2" as SpidLevel,
    walletToken: getToken("AAAAAAAAAAAAA1"),
    myPortalToken: getToken("AAAAAAAAAAAAA2"),
    bpdToken: getToken("AAAAAAAAAAAAA3"),
    zendeskToken: getToken("AAAAAAAAAAAAA4")
  };

  return {
    payload: validatePayload(PublicSession, customSession),
    isJson: true
  };
};
