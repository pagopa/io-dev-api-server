import { IdpsTextData } from "../../generated/definitions/content/IdpsTextData";
import { validatePayload } from "../utils/validator";

const mockIdps: IdpsTextData = {
  version: 1,
  it: {
    arubaid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    infocertid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    intesaid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    lepidaid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    namirialid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    posteid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    sielteid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    spiditalia: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    timid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    xx_servizicie: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    }
  },
  en: {
    arubaid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    infocertid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    intesaid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    lepidaid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    namirialid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    posteid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    sielteid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    spiditalia: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    timid: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    },
    xx_servizicie: {
      description: "**description**",
      email: {
        cta: "invia un'e-mail",
        action: "<EMAIL>"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "<INDIRIZZO WEB>"
      },
      phone: {
        cta: "chiama",
        action: "<TELEFONO>"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "<INDIRIZZO WEB PROVIDER>"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "<INDIRIZZO WEB>"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "<INDIRIZZO WEB>"
      }
    }
  }
};

export const idps = validatePayload(IdpsTextData, mockIdps);
