import * as t from "io-ts";

export const backendInfo = {
  min_app_version: { android: "0.0.0", ios: "0.0.0" },
  min_app_version_pagopa: { android: "0.0.0", ios: "0.0.0" },
  version: "2.1.2"
};

// required attributes

const BackendStatusMessage = t.interface({
  "it-IT": t.string,
  "en-EN": t.string
});

const BackendStatusR = t.interface({
  is_alive: t.boolean,
  message: BackendStatusMessage
});

export const BackendStatus = t.exact(BackendStatusR, "BackendStatus");

export type BackendStatus = t.TypeOf<typeof BackendStatus>;

// ref https://iopstcdnassets.z6.web.core.windows.net/status/backend.json
export const backendStatus = {
  is_alive: true,
  message: {
    "it-IT": "messaggio in italiano",
    "en-EN": "english message"
  }
};
