import { faker } from "@faker-js/faker/locale/it";
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

// eslint-disable-next-line functional/no-let
let mFIMSToken: string | undefined;
export const FIMSToken = () => {
  if (!mFIMSToken) {
    mFIMSToken = getToken("AAAAAAAAAAAAA5");
  }
  return mFIMSToken;
};

const generateSessionTokens = (): PublicSession => ({
  spidLevel: "https://www.spid.gov.it/SpidL2" as SpidLevel,
  walletToken: getToken("AAAAAAAAAAAAA1"),
  myPortalToken: getToken("AAAAAAAAAAAAA2"),
  bpdToken: getToken("AAAAAAAAAAAAA3"),
  zendeskToken: getToken("AAAAAAAAAAAAA4"),
  fimsToken: FIMSToken()
});

// eslint-disable-next-line functional/no-let
let customSession: PublicSession | undefined;

export const createOrRefreshSessionTokens = () => {
  customSession = generateSessionTokens();
};

export const clearSessionTokens = () => {
  customSession = undefined;
};

export const getCustomSession = (): IOResponse<PublicSession> | undefined =>
  customSession
    ? {
        payload: validatePayload(PublicSession, customSession),
        isJson: true
      }
    : undefined;
