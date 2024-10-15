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

export const generateCustomObjectSessionTokens = (
  tokenString: string | ParsedQs | string[] | ParsedQs[]
): Partial<PublicSession> => {
  // If no tokenString is provided, return the entire tokensObject
  if (!tokenString || typeof tokenString !== "string") {
    customSession = generateSessionTokens();
  } else {
    // Parse the tokenString to extract the tokens
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tokenKeys: Array<keyof PublicSession> = tokenString
      .replace(/[()]/g, "") // Remove parentheses
      .split(",") // Split by comma
      .filter(
        (key: string): key is keyof PublicSession =>
          key in generateSessionTokens()
      ); // Ensure keys are valid
    // Return a filtered object based on tokenKeys
    const filteredEntries = tokenKeys.map(key => [
      key,
      generateSessionTokens()[key]
    ]);
    customSession = Object.fromEntries(
      filteredEntries
    ) as Partial<PublicSession>;
  }
  return customSession;
};

export const createOrRefreshSessionTokens = () => {
  customSession = generateSessionTokens();
};

export const clearSessionTokens = () => {
  customSession = undefined;
};

export const getCustomSession = (
  query?: QueryString.ParsedQs
): IOResponse<PublicSession> | undefined => {
  if (query?.fields) {
    return {
      payload: validatePayload(
        PublicSession,
        generateCustomObjectSessionTokens(query?.fields)
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

export const shouldAddLollipopAssertionRef = (query?: QueryString.ParsedQs) =>
  !query?.fields ||
  (typeof query.fields === "string" &&
    query.fields.includes("lollipopAssertionRef"));
