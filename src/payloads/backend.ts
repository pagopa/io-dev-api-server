import { ToolEnum } from "../../generated/definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../generated/definitions/content/BackendStatus";
import { LevelEnum } from "../../generated/definitions/content/SectionStatus";
import { pnOptInServiceId } from "../features/pn/services/services";

export const backendInfo = {
  min_app_version: { android: "1.27.0", ios: "1.27.0" },
  min_app_version_pagopa: { android: "0.0.0", ios: "0.0.0" },
  version: "2.1.2"
};

// ref https://assets.cdn.io.pagopa.it/status/backend.json
export const backendStatus: BackendStatus = {
  is_alive: true,
  message: {
    "it-IT": "",
    "en-EN": "English message"
  },
  config: {
    bpd_ranking: false,
    bpd_ranking_v2: true,
    cgn_merchants_v2: false,
    payments: {},
    bpd: {
      enroll_bpd_after_add_payment_method: false,
      program_active: true,
      opt_in_payment_methods: false,
      opt_in_payment_methods_v2: true
    },
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
    fims: {
      enabled: true,
      domain: "http://localhost:3000/"
    },
    uaDonations: {
      enabled: false,
      banner: {
        visible: false,
        description: {
          "it-IT":
            "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civili della crisi in Ucraina",
          "en-EN":
            "Make a donation to humanitarian organizations that assist the civilians affected by the crisis in Ukraine"
        },
        url: "https://assets.cdn.io.pagopa.it/html/donate.html"
      }
    },
    premiumMessages: {
      opt_in_out_enabled: true
    },
    cdc: {
      enabled: false
    },
    barcodesScanner: {
      dataMatrixPosteEnabled: true
    },
    fci: {
      enabled: true,
      min_app_version: {
        ios: "1.2.3",
        android: "1.2.3"
      }
    },
    lollipop: {
      enabled: false,
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      }
    },
    pn: {
      enabled: true,
      min_app_version: {
        ios: "2.35.0.1",
        android: "2.35.0.1"
      },
      frontend_url: "https://cittadini.notifichedigitali.it",
      optInServiceId: pnOptInServiceId
    },
    idPay: {
      min_app_version: {
        ios: "1.2.3",
        android: "1.2.3"
      }
    },
    newPaymentSection: {
      enabled: false,
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      }
    },
    fastLogin: {
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      },
      opt_in: {
        min_app_version: {
          ios: "0.0.0",
          android: "0.0.0"
        }
      }
    },
    emailUniquenessValidation: {
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      }
    },
    nativeLogin: {
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      }
    },
    tos: {
      tos_version: 4.8,
      tos_url: "https://io.italia.it/app-content/tos_privacy.html"
    }
  },
  sections: {
    email_validation: {
      is_visible: false,
      level: LevelEnum.critical,
      web_url: {
        "it-IT": "https://io.italia.it/status/#2012081628",
        "en-EN": "https://io.italia.it/status/en/#2012081628"
      },
      message: {
        "it-IT":
          "Il messaggio di validazione indirizzo email potrebbe arrivare dopo diverse ore.",
        "en-EN": "The email validation message may arrive after several hours."
      }
    },
    cashback: {
      is_visible: true,
      level: LevelEnum.warning,
      web_url: {
        "it-IT": "https://io.italia.it/cashback",
        "en-EN": "https://io.italia.it/cashback"
      },
      message: {
        "it-IT": "L’iniziativa del Cashback si è conclusa.",
        "en-EN": "The Cashback initiative has ended."
      }
    },
    cdc: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    cgn: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    fims: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    messages: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "Ci sono dei problemi con la visualizzazione delle Certificazioni Verdi. I tecnici sono al lavoro per ripristinare il servizio.",
        "en-EN":
          "We’re having issues showing EU digital COVID certificates. Technicians are working to restore service."
      }
    },
    services: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "Stiamo aggiornando i servizi locali. La lista tornerà presto disponibile.",
        "en-EN": "We're updating local services. The list will be back soon."
      }
    },
    login: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "I nostri sistemi potrebbero rispondere con lentezza, ci scusiamo per il disagio.",
        "en-EN":
          "Our systems may respond slowly, we apologize for the inconvenience."
      }
    },
    wallets: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "Dalle 20:30 alle 22:40 non sarà possibile pagare con PayPal.",
        "en-EN": "PayPal services won't be available from 8:30 to 10:40 PM."
      }
    },
    ingress: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "I nostri sistemi potrebbero rispondere con lentezza, ci scusiamo per il disagio.",
        "en-EN":
          "Our systems may respond slowly, we apologize for the inconvenience."
      }
    },
    bancomat: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    satispay: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    bancomatpay: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    credit_card: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "Per il grande numero di richieste, la verifica della tua carta potrebbe subire dei rallentamenti",
        "en-EN":
          "Due to the big number of requests, the card verification process may be slowed down"
      },
      badge: {
        "it-IT": "possibili rallentamenti",
        "en-EN": "possible slowdowns"
      }
    },
    paypal: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    digital_payments: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    cobadge: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": ""
      }
    },
    euCovidCert: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "Ci sono dei problemi con la visualizzazione delle Certificazioni Verdi. I tecnici sono al lavoro per ripristinare il servizio.",
        "en-EN":
          "We’re having issues showing EU digital COVID certificates. Technicians are working to restore service."
      }
    },
    favourite_language: {
      is_visible: true,
      level: LevelEnum.normal,
      web_url: {
        "it-IT": "https://github.com/pagopa/io-app/issues/new/choose",
        "en-EN": "https://github.com/pagopa/io-app/issues/new/choose"
      },
      message: {
        "it-IT": "La traduzione in tedesco è in corso. Contribuisci su GitHub!",
        "en-EN": "German translation is in progress. Contribute on GitHub!"
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
        "it-IT": "",
        "en-EN": ""
      }
    }
  }
};
