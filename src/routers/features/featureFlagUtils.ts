import { IncomingHttpHeaders } from "http";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { PatternString } from "@pagopa/ts-commons/lib/strings";
import { compare } from "compare-versions";
import { backendStatus } from "../../payloads/backend";
import { VersionPerPlatform } from "../../../generated/definitions/content/VersionPerPlatform";
import { BackendStatus } from "../../../generated/definitions/content/BackendStatus";
import { getAppVersion } from "../../persistence/appInfo";

type DeviceOS = {
  iPhone: keyof VersionPerPlatform;
  Android: keyof VersionPerPlatform;
};

const osPerDevice: DeviceOS = {
  iPhone: "ios",
  Android: "android"
};

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

export const isVersionValidAndActive = (version: string | undefined) =>
  pipe(
    version,
    PatternString(`^(?!0(.0)*$)\\d+(\\.\\d+)*$`).decode,
    E.fold(
      _ => false,
      minAppVersion =>
        pipe(
          getAppVersion(),
          PatternString(`^(?!0(.0)*$)\\d+(\\.\\d+)*$`).decode,
          E.fold(
            _ => false,
            userAppVersion => compare(minAppVersion, userAppVersion, "<=")
          )
        )
    )
  );

export const getOsFromUserAgent = (reqHeaders: IncomingHttpHeaders) =>
  pipe(
    reqHeaders["user-agent"],
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

export const isFeatureFlagWithMinVersionEnabled = (
  featureFlag: FeatureFlagWithMinAppVersion<BackendStatus["config"]>,
  reqHeaders: IncomingHttpHeaders
) =>
  pipe(
    O.fromNullable(backendStatus.config[featureFlag]?.min_app_version),
    O.fold(
      () => false,
      (min_app_version: VersionPerPlatform) =>
        pipe(
          getOsFromUserAgent(reqHeaders),
          O.fold(
            () => false,
            os => isVersionValidAndActive(min_app_version[os])
          )
        )
    )
  );
