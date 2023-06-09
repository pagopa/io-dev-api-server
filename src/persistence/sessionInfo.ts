import { faker } from "@faker-js/faker/locale/it";
import { Request } from "express";

import { ioDevServerConfig } from "../config";
import { isFeatureFlagWithMinVersionEnabled } from "../routers/features/featureFlagUtils";
import { getDateMsDifference } from "../utils/date";

enum LoginEnum {
  standard = "STANDARD",
  fastLogin = "LV"
}

type LoginSessionTokenInfo = {
  loginSessionToken: string | undefined;
  instantiationDate: Date | undefined;
  loginType: LoginEnum | undefined;
};

const loginSessionTokenInfo: LoginSessionTokenInfo = {
  loginSessionToken: undefined,
  instantiationDate: undefined,
  loginType: undefined
};

export const getLoginSessionToken = () =>
  loginSessionTokenInfo.loginSessionToken;

export const clearLoginSessionTokenInfo = () =>
  Object.keys(loginSessionTokenInfo).forEach(key => {
    loginSessionTokenInfo[key as keyof LoginSessionTokenInfo] = undefined;
  });

const setLoginSessionToken = (newToken: string) => {
  loginSessionTokenInfo.loginSessionToken = newToken;
  loginSessionTokenInfo.instantiationDate = new Date();
};

const generateNewLoginToken = () => faker.random.alphaNumeric(11).toUpperCase();

export const createOrRefreshSessionToken = () => {
  setLoginSessionToken(generateNewLoginToken());
  return loginSessionTokenInfo.loginSessionToken;
};

export const setSessionLoginType = (req: Request) => {
  loginSessionTokenInfo.loginType = req.get("x-pagopa-login-type") as
    | LoginEnum
    | undefined;
};

export const isSessionTokenValid = () => {
  // user not authenticated yet
  if (!loginSessionTokenInfo.instantiationDate) {
    return true;
  }

  // if user is authenticated but this is not a fast login, the token in always ok
  if (loginSessionTokenInfo.loginType !== LoginEnum.fastLogin) {
    return true;
  }

  if (!isFeatureFlagWithMinVersionEnabled("fastLogin")) {
    return false;
  }

  if (!ioDevServerConfig.features.fastLogin) {
    return false;
  }
  return (
    getDateMsDifference(new Date(), loginSessionTokenInfo.instantiationDate) <
    ioDevServerConfig.features.fastLogin.sessionTTLinMS
  );
};
