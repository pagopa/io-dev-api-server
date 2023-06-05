// eslint-disable-next-line functional/no-let
let appVersion: string | undefined;

export function getAppVersion() {
  return appVersion;
}

export function setAppVersion(version: string | undefined) {
  appVersion = version;
}
