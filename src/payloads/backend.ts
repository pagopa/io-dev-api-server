import { ToolEnum } from "../../generated/definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../generated/definitions/content/BackendStatus";
import { LevelEnum } from "../../generated/definitions/content/SectionStatus";
import { serverPort, serverUrl } from "../utils/server";

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
    cdc: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    cashback: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "Il cashback è in manutenzione, tornerà operativo a breve",
        "en-EN":
          "Cashback is under maintenance, it will be operational again soon"
      }
    },
    cgn: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "Il cashback è in manutenzione, tornerà operativo a breve",
        "en-EN":
          "Cashback is under maintenance, it will be operational again soon"
      }
    },
    fims: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": ""
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
    paypal: {
      is_visible: false,
      level: LevelEnum.warning,
      badge: {
        "it-IT": "",
        "en-EN": ""
      },
      message: {
        "it-IT": "",
        "en-EN": ""
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
      program_active: false,
      opt_in_payment_methods: false
    },
    bpd_ranking: true,
    bpd_ranking_v2: true,
    cgn_merchants_v2: false,
    assistanceTool: {
      tool: ToolEnum.zendesk
    },
    paypal: {
      enabled: true
    },
    bancomatPay: {
      display: true,
      onboarding: true,
      payment: true
    },
    cgn: {
      enabled: true,
      merchants_v2: false
    },
    uaDonations: {
      enabled: true,
      banner: {
        visible: true,
        description: {
          "it-IT":
            "Con IO puoi fare una donazione alle organizzazioni umanitarie che assistono le vittime del conflitto in Ucraina",
          "en-EN":
            "With IO you can make a donation to humanitarian organizations that assist the victims of the conflict in Ukraine"
        },
        url: `${serverUrl}/donate`
      }
    },
    fims: {
      enabled: false,
      domain: `http://localhost:${serverPort}`
    },
    premiumMessages: {
      opt_in_out_enabled: false
    },
    cdc: {
      enabled: true
    },
    barcodesScanner: {
      dataMatrixPosteEnabled: false
    },
    fci: {
      enabled: false
    },
    pn: {
      enabled: true,
      frontend_url: `http://localhost:${serverPort}`
    }
  }
};
