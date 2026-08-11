import { Request } from "express";

type osPlatform = "ios" | "android";

type DeviceOS = {
  iPhone: osPlatform;
  Android: osPlatform;
  Darwin: osPlatform;
};

const osPerDevice: DeviceOS = {
  iPhone: "ios",
  Android: "android",
  Darwin: "ios"
};

type AppInfo = {
  appVersion: string | undefined;
  appOs: osPlatform | undefined;
};

const appInfo: AppInfo = {
  appVersion: undefined,
  appOs: undefined
};

export function getAppVersion() {
  return appInfo.appVersion;
}
export const getAppOs = () => appInfo.appOs;

export const clearAppInfo = () => {
  // eslint-disable-next-line functional/immutable-data
  appInfo.appVersion = undefined;
  // eslint-disable-next-line functional/immutable-data
  appInfo.appOs = undefined;
};

export function setAppInfo(req: Request) {
  const version = req.get("x-pagopa-app-version");
  const os = getOsFromUserAgent(req);

  // eslint-disable-next-line functional/immutable-data
  appInfo.appVersion = version;
  // eslint-disable-next-line functional/immutable-data
  appInfo.appOs = os;
}

const getOsFromUserAgent = (req: Request) => {
  const userAgentMaybe = req.get("user-agent");
  if (!userAgentMaybe) {
    return undefined;
  }

  const normalizedUserAgent = userAgentMaybe.toLowerCase();

  const keys = Object.keys(osPerDevice) as Array<keyof typeof osPerDevice>;
  const keyMaybe = keys.find(key =>
    normalizedUserAgent.includes(key.toLowerCase())
  );
  if (!keyMaybe) {
    return undefined;
  }

  return osPerDevice[keyMaybe];
};
