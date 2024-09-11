import { faker } from "@faker-js/faker/locale/it";
import QueryString, { ParsedQs } from "qs";
import { getRandomValue } from "../utils/random";
import { validatePayload } from "../utils/validator";
import { PublicSession } from "../../generated/definitions/session_manager/PublicSession";
import { SpidLevel } from "../../generated/definitions/session_manager/SpidLevel";
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

const tokensObject: PublicSession = {
  spidLevel: "https://www.spid.gov.it/SpidL2" as SpidLevel,
  walletToken: getToken("AAAAAAAAAAAAA1"),
  myPortalToken: getToken("AAAAAAAAAAAAA2"),
  bpdToken: getToken("AAAAAAAAAAAAA3"),
  zendeskToken: getToken("AAAAAAAAAAAAA4"),
  fimsToken: FIMSToken()
};

const generateSessionTokens = (): PublicSession => tokensObject;

export const generateCustomObjectSessionTokens = (
  tokenString: string | ParsedQs | string[] | ParsedQs[]
): Partial<PublicSession> => {
  // If no tokenString is provided, return the entire tokensObject
  if (!tokenString || typeof tokenString !== "string") {
    return tokensObject;
  }

  // Parse the tokenString to extract the tokens
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tokenKeys: Array<keyof PublicSession> = tokenString
    .replace(/[()]/g, "") // Remove parentheses
    .split(",") // Split by comma
    .filter((key: string): key is keyof PublicSession => key in tokensObject); // Ensure keys are valid
  // Return a filtered object based on tokenKeys
  const filteredEntries = tokenKeys.map(key => [key, tokensObject[key]]);
  return Object.fromEntries(filteredEntries) as Partial<PublicSession>;
};

// eslint-disable-next-line functional/no-let
let customSession: PublicSession | undefined;

export const createOrRefreshSessionTokens = () => {
  customSession = generateSessionTokens();
};

export const clearSessionTokens = () => {
  customSession = undefined;
};

export const getCustomSession = (
  value?: QueryString.ParsedQs
): IOResponse<PublicSession> | undefined => {
  if (value?.fields) {
    return {
      payload: validatePayload(
        PublicSession,
        generateCustomObjectSessionTokens(value?.fields)
      ),
      isJson: true
    };
  }
  return customSession
    ? {
        payload: validatePayload(PublicSession, customSession),
        isJson: true
      }
    : undefined;
};
