import { ServerInfo } from "../../generated/definitions/backend/ServerInfo";
import { validatePayload } from "../../src/utils/validator";

const info: ServerInfo = {
  min_app_version: { android: "0.0.0", ios: "0.0.0" },
  min_app_version_pagopa: { android: "0.0.0", ios: "0.0.0" },
  version: "2.1.2"
};
export const backendInfo = validatePayload(ServerInfo, info);
