import * as t from "io-ts";

export const backendInfo = {
  min_app_version: { android: "0.0.0", ios: "0.0.0" },
  min_app_version_pagopa: { android: "0.0.0", ios: "0.0.0" },
  version: "2.1.2"
};

// required attributes
const LocalizedMessage = t.interface({
  "it-IT": t.string,
  "en-EN": t.string
});

const BackendStatusR = t.interface({
  is_alive: t.boolean,
  message: LocalizedMessage
});

// SectionStatus represents the status of a single section
const SectionStatusR = t.interface({
  is_visible: t.boolean,
  message: LocalizedMessage,
  level: t.union([
    t.literal("normal"),
    t.literal("warning"),
    t.literal("critical")
  ])
});

const SectionStatusO = t.partial({
  web_url: LocalizedMessage
});

export const SectionStatus = t.intersection(
  [SectionStatusR, SectionStatusO],
  "SectionStatus"
);
export type SectionStatus = t.TypeOf<typeof SectionStatus>;

const Sections = t.interface({
  ingress: SectionStatus,
  messages: SectionStatus,
  wallets: SectionStatus,
  login: SectionStatus,
  services: SectionStatus
});
const BackendStatusO = t.partial({
  sections: Sections
});

export const BackendStatus = t.intersection(
  [BackendStatusR, BackendStatusO],
  "BackendStatus"
);
export type BackendStatus = t.TypeOf<typeof BackendStatus>;

// ref https://iopstcdnassets.z6.web.core.windows.net/status/backend.json
export const backendStatus: BackendStatus = {
  is_alive: true,
  message: {
    "it-IT": "messaggio personalizzabile in italiano test test",
    "en-EN": "english message"
  },
  sections: {
    messages: {
      is_visible: false,
      level: "warning",
      message: {
        "it-IT":
          "la sezione messaggi è in manutenzione, tornerà operativa a breve",
        "en-EN":
          "the messages section is under maintenance, it will be operational again shortly"
      }
    },
    services: {
      is_visible: false,
      level: "critical",
      web_url: {
        "it-IT": "https://io.italia.it/",
        "en-EN": "https://io.italia.it/"
      },
      message: {
        "it-IT":
          "la sezione messaggi è in manutenzione, tornerà operativa a breve",
        "en-EN":
          "the messages section is under maintenance, it will be operational again shortly"
      }
    },
    login: {
      is_visible: false,
      level: "normal",
      web_url: {
        "it-IT": "https://io.italia.it/",
        "en-EN": "https://io.italia.it/"
      },
      message: {
        "it-IT":
          "il sistema di autenticazione è in manutenzione, tornerà operativa a breve",
        "en-EN":
          "the authentication system is under maintenance, it will be operational again shortly"
      }
    },
    wallets: {
      is_visible: false,
      level: "critical",
      web_url: {
        "it-IT": "https://io.italia.it/",
        "en-EN": "https://io.italia.it/"
      },
      message: {
        "it-IT":
          "la sezione portafoglio è in manutenzione, tornerà operativa a breve",
        "en-EN":
          "the wallet section is under maintenance, it will be operational again shortly"
      }
    },
    ingress: {
      is_visible: false,
      level: "critical",
      web_url: {
        "it-IT": "https://io.italia.it/",
        "en-EN": "https://io.italia.it/"
      },
      message: {
        "it-IT":
          "i nostri sistemi potrebbero rispondere con lentezza, ci scusiamo per il disagio",
        "en-EN":
          "our systems may respond slowly, we apologize for the inconvenience"
      }
    }
  }
};
