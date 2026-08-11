import * as E from "fp-ts/lib/Either";
import { PatternString } from "@pagopa/ts-commons/lib/strings";
import { compare } from "compare-versions";
import { backendStatus } from "../../payloads/backend";
import { VersionPerPlatform } from "../../../generated/definitions/content/VersionPerPlatform";
import { BackendStatus } from "../../../generated/definitions/content/BackendStatus";
import { getAppVersion, getAppOs } from "../../persistence/appInfo";

type FeatureFlagWithMinAppVersion<T> = Extract<
  keyof T,
  {
    [K in keyof T]: T[K] extends
      | { min_app_version?: VersionPerPlatform }
      | undefined
      ? K
      : never;
  }[keyof T]
>;

export const isVersionValidAndActive = (
  version: string | undefined
): boolean => {
  const versionEither = PatternString(`^(?!0(.0)*$)\\d+(\\.\\d+)*$`).decode(
    version
  );
  if (E.isLeft(versionEither)) {
    return false;
  }

  const appVersionEither = PatternString(`^(?!0(.0)*$)\\d+(\\.\\d+)*$`).decode(
    getAppVersion()
  );
  if (E.isLeft(appVersionEither)) {
    return false;
  }

  return compare(versionEither.right, appVersionEither.right, "<=");
};

export const isFeatureFlagWithMinVersionEnabled = (
  featureFlag: FeatureFlagWithMinAppVersion<BackendStatus["config"]>
): boolean => {
  const minAppVersion = backendStatus.config[featureFlag]?.min_app_version;
  if (!minAppVersion) {
    return false;
  }
  const operatingSystem = getAppOs();
  if (!operatingSystem) {
    return false;
  }
  return isVersionValidAndActive(minAppVersion[operatingSystem]);
};
