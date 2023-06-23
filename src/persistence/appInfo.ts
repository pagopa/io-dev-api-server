import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";
import { Request } from "express";
import { VersionPerPlatform } from "../../generated/definitions/content/VersionPerPlatform";

type DeviceOS = {
  iPhone: keyof VersionPerPlatform;
  Android: keyof VersionPerPlatform;
};

const osPerDevice: DeviceOS = {
  iPhone: "ios",
  Android: "android"
};

type AppInfo = {
  appVersion: string | undefined;
  appOs: O.Option<keyof VersionPerPlatform>;
};

const appInfo: AppInfo = {
  appVersion: undefined,
  appOs: O.none
};

export function getAppVersion() {
  return appInfo.appVersion;
}
export const getAppOs = () => appInfo.appOs;

export const clearAppInfo = () => {
  // eslint-disable-next-line functional/immutable-data
  appInfo.appVersion = undefined;
  // eslint-disable-next-line functional/immutable-data
  appInfo.appOs = O.none;
};

export function setAppInfo(req: Request) {
  const version = req.get("x-pagopa-app-version");
  const os = getOsFromUserAgent(req);

  // eslint-disable-next-line functional/immutable-data
  appInfo.appVersion = version;
  // eslint-disable-next-line functional/immutable-data
  appInfo.appOs = os;
}

const getOsFromUserAgent = (req: Request) =>
  pipe(
    req.get("user-agent"),
    O.fromNullable,
    O.fold(
      () => O.none,
      userAgent =>
        pipe(
          Object.keys(osPerDevice),
          A.findFirst(k => userAgent.includes(k)),
          O.map(a => osPerDevice[a as keyof typeof osPerDevice])
        )
    )
  );
