import { BackendStatus } from "../../generated/definitions/content/BackendStatus";
import { LevelEnum } from "../../generated/definitions/content/SectionStatus";
import { ioDevServerConfig } from "../config";

export const backendInfo = {
  min_app_version: { android: "1.27.0", ios: "1.27.0" },
  min_app_version_pagopa: { android: "0.0.0", ios: "0.0.0" },
  version: "2.1.2"
};

// ref https://assets.cdn.io.italia.it/status/backend.json
export const backendStatus: BackendStatus = {
  is_alive: true,
  message: {
    "it-IT": "messaggio personalizzabile in italiano test test",
    "en-EN": "english message"
  },
  sections: {
    cashback: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "Il cashback è in manutenzione, tornerà operativo a breve",
        "en-EN":
          "Cashback is under maintenance, it will be operational again soon"
      }
    },
    email_validation: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "la sezione messaggi è in manutenzione, tornerà operativa a breve",
        "en-EN":
          "the messages section is under maintenance, it will be operational again shortly"
      }
    },
    messages: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "la sezione messaggi è in manutenzione, tornerà operativa a breve",
        "en-EN":
          "the messages section is under maintenance, it will be operational again shortly"
      }
    },
    services: {
      is_visible: false,
      level: LevelEnum.critical,
      web_url: {
        "it-IT": "https://io.italia.it/",
        "en-EN": "https://io.italia.it/"
      },
      message: {
        "it-IT":
          "la sezione servizi è in manutenzione, tornerà operativa a breve",
        "en-EN":
          "the services section is under maintenance, it will be operational again shortly"
      }
    },
    login: {
      is_visible: false,
      level: LevelEnum.normal,
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
      level: LevelEnum.critical,
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
      level: LevelEnum.critical,
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
    },
    credit_card: {
      is_visible: false,
      level: LevelEnum.warning,
      badge: {
        "it-IT": "warning message",
        "en-EN": "possible slowness"
      },
      message: {
        "it-IT": "warning message",
        "en-EN": "possible slowness"
      }
    },
    satispay: {
      is_visible: false,
      level: LevelEnum.critical,
      message: {
        "it-IT": "satispay",
        "en-EN": "satispay"
      }
    },
    bancomat: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "bancomat",
        "en-EN": "bancomat"
      },
      badge: {
        "it-IT": "bancomat badge",
        "en-EN": "bancomat"
      }
    },
    bancomatpay: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "bancomatpay",
        "en-EN": "bancomatpay"
      }
    },
    digital_payments: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "digital_payments",
        "en-EN": "digital_payments"
      }
    },
    cobadge: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "cobadge",
        "en-EN": "cobadge"
      }
    },
    euCovidCert: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "euCovidCert banner test",
        "en-EN": "euCovidCert banner test"
      }
    },
    favourite_language: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    app_update_required: {
      is_visible: false,
      level: LevelEnum.normal,
      web_url: {
        "it-IT": "",
        "en-EN": ""
      },
      message: {
        "it-IT": "aggiornamento richiesto",
        "en-EN": "update required"
      }
    }
  },
  config: {
    bpd: {
      enroll_bpd_after_add_payment_method: false,
      program_active: true
    },
    bpd_ranking: true,
    bpd_ranking_v2: true,
    cgn_merchants_v2: false,
    assistanceTool: {
      tool: ioDevServerConfig.assistanceTools.tool
    }
  }
};
