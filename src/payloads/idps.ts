import { IdpsTextData } from "../../generated/definitions/content/IdpsTextData";
import { validatePayload } from "../utils/validator";

const mockIdps: IdpsTextData = {
  version: 1,
  it: {
    arubaid: {
      description:
        "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Aruba selezionando una delle opzioni disponibili qui.",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      },
      phone: {
        cta: "chiama",
        action: "003905750504"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.pec.it/richiedi-spid-aruba-id.aspx"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://selfcarespid.aruba.it/#/recovery-username"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://selfcarespid.aruba.it/#/recovery-password"
      },
      recover_emergency_code: {
        cta: "Recupera codice di emergenza",
        action: "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      }
    },
    infocertid: {
      description:
        "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da InfoCert  selezionando una delle opzioni disponibili qui di seguito. \n Inoltre, per ulteriori informazioni puoi consultare la [le FAQ e le guide](https://help.infocert.it/Cerca?searchText=spid) fornite dal tuo Identity Provider.",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://contatta.infocert.it/ticket/"
      },
      phone: {
        cta: "chiama",
        action: "00390654641489"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://identitadigitale.infocert.it/"
      },
      recover_username: {
        cta: "Recupera l'username",
        action:
          "https://help.infocert.it/home/faq/come-posso-recuperare-la-user-id-di-accesso-alla-mia-identita-digitale"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://my.infocert.it/selfcare/#/recoveryPin"
      }
    },
    intesaid: {
      description:
        "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Intesa  selezionando una delle opzioni disponibili qui di seguito.",
      email: {
        cta: "invia un'e-mail",
        action: "hdintesa@advalia.com"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://www.hda.intesa.it/area-clienti"
      },
      phone: {
        cta: "chiama",
        action: "800805093"
      },
      phone_international: {
        cta: "chiama",
        action: "00390287119396"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.intesa.it/intesaid"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://spid.intesa.it/area-privata/recupera-password.aspx"
      }
    },
    lepidaid: {
      description:
        "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Lepida selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare il [Manuale Utente](https://id.lepida.it/docs/manuale_utente.pdf) fornito da tuo Identity Provider.",
      email: {
        cta: "invia un'e-mail",
        action: "helpdesk@lepida.it"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action:
          "https://www.lepida.net/assistenza/richiesta-assistenza-lepidaid"
      },
      phone: {
        cta: "chiama",
        action: "800445500"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://id.lepida.it/idm/app/#lepida-spid-id"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://id.lepida.it/lepidaid/recuperausername"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://id.lepida.it/lepidaid/recuperapassword"
      }
    },
    namirialid: {
      description:
        "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Namirial selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare le [FAQ](https://support.namirial.com/it/faq/faq-tsp/faq-tsp-spid) fornite dal tuo Identity Provider.",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://support.namirial.com/it/supporto-tecnico"
      },
      phone: {
        cta: "chiama",
        action: "003907163494"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.namirialtsp.com/spid/"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://portal.namirialtsp.com/public/retrieveUsername.xhtml"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://portal.namirialtsp.com/public/resetPassword.xhtml"
      }
    },
    posteid: {
      description:
        "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Poste Italiane  selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare le [FAQ](https://www.poste.it/faq-poste-id.html) fornite dal tuo Identity Provider ed il [Manuale Utente](https://posteid.poste.it/risorse/condivise/doc/manuale_operativo.pdf).",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://www.poste.it/scrivici.html"
      },
      phone: {
        cta: "chiama",
        action: "800007777"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://posteid.poste.it"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://posteid.poste.it/recuperocredenziali.shtml"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://posteid.poste.it/recuperocredenziali.shtml"
      }
    },
    sielteid: {
      description:
        "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Sielte  selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare le [FAQ](https://www.sielteid.it/faq.html) fornite dal tuo Identity Provider ed il [Manuale Utente](https://www.sielteid.it/documents/ManualeUtente.pdf).",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://www.sielteid.it/contact.html#blocco-contatti-form"
      },
      phone: {
        cta: "chiama",
        action: "00390957171301"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.sielteid.it/che-cos-e-sielteid.html"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://myid.sieltecloud.it/profile/forgotPassword"
      }
    },
    spiditalia: {
      description:
        "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Register mediante il bottone qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare le [FAQ](https://www.register.it/spid#pgc-23051-10-0) fornite dal tuo Identity Provider ed il [Manuale Utente](https://spid.register.it/doc/Guida_Utente_SPID.pdf).",
      phone: {
        cta: "chiama",
        action: "+390355787979"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.register.it/spid/ "
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://spid.register.it/selfcare/recovery/username "
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://spid.register.it/selfcare/recovery/password"
      }
    },
    timid: {
      description:
        "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Tim  selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare il [Manuale Utente](https://www.trusttechnologies.it/wp-content/uploads/SPIDPRIN.TT_.DPMU15000.03-Guida-Utente-al-servizio-TIM-ID.pdf) fornito dal tuo Identity Provider.",
      email: {
        cta: "invia un'e-mail",
        action: "supportotimid@telecomitalia.it"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://www.trusttechnologies.it/contatti/#form"
      },
      phone: {
        cta: "chiama",
        action: "800405800"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://spid.tim.it/tim-id-portal"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://login.id.tim.it/mps/fu.php"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://login.id.tim.it/mps/fp.php"
      }
    },
    cie: {
      description: "The selected provider is used for development purposes.",
      email: {
        cta: "invia un'e-mail",
        action: "fake@email.it"
      },
      phone: {
        cta: "chiama",
        action: "00000000"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.pagopa.gov.it/it/pagopa-spa/"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://www.pagopa.gov.it/it/pagopa-spa/"
      }
    },
    test: {
      description: "The selected provider is used for development purposes.",
      email: {
        cta: "invia un'e-mail",
        action: "fake@email.it"
      },
      phone: {
        cta: "chiama",
        action: "00000000"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.pagopa.gov.it/it/pagopa-spa/"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://www.pagopa.gov.it/it/pagopa-spa/"
      }
    }
  },
  en: {
    arubaid: {
      description:
        "For problems encountered during the authentication process , you can reach the support desk of Aruba by selecting  one of the options presented below.",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      },
      phone: {
        cta: "chiama",
        action: "003905750504"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.pec.it/richiedi-spid-aruba-id.aspx"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://selfcarespid.aruba.it/#/recovery-username"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://selfcarespid.aruba.it/#/recovery-password"
      },
      recover_emergency_code: {
        cta: "Recupera codice di emergenza",
        action: "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      }
    },
    infocertid: {
      description:
        "For problems encountered during the authentication process,  you can reach the support desk of InfoCert by selecting  one of the options presented below. \n For further details you can refer to the [FAQ](https://help.infocert.it/Cerca?searchText=spid) gathered by your Identity Provider.",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://contatta.infocert.it/ticket/"
      },
      phone: {
        cta: "chiama",
        action: "00390654641489"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://identitadigitale.infocert.it/"
      },
      recover_username: {
        cta: "Recupera l'username",
        action:
          "https://help.infocert.it/home/faq/come-posso-recuperare-la-user-id-di-accesso-alla-mia-identita-digitale"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://my.infocert.it/selfcare/#/recoveryPin"
      }
    },
    intesaid: {
      description:
        "For problems encountered during the authentication process,  you can reach the support desk of Intesa by selecting  one of the options presented below.",
      email: {
        cta: "invia un'e-mail",
        action: "hdintesa@advalia.com"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://www.hda.intesa.it/area-clienti"
      },
      phone: {
        cta: "chiama",
        action: "800805093"
      },
      phone_international: {
        cta: "chiama",
        action: "00390287119396"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.intesa.it/intesaid"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://spid.intesa.it/area-privata/recupera-password.aspx"
      }
    },
    lepidaid: {
      description:
        "For problems encountered during the authentication process,  you can reach the support desk of Lepida by selecting  one of the options presented below. \n For further details you can refer to the [User Guide](https://id.lepida.it/docs/manuale_utente.pdf).",
      email: {
        cta: "invia un'e-mail",
        action: "helpdesk@lepida.it"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action:
          "https://www.lepida.net/assistenza/richiesta-assistenza-lepidaid"
      },
      phone: {
        cta: "chiama",
        action: "800445500"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://id.lepida.it/idm/app/#lepida-spid-id"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://id.lepida.it/lepidaid/recuperausername"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://id.lepida.it/lepidaid/recuperapassword"
      }
    },
    namirialid: {
      description:
        "For problems encountered during the authentication process,  you can reach the support desk of Namirial by selecting  one of the options presented below. \n For further details you can refer to the [FAQ](https://support.namirial.com/it/faq/faq-tsp/faq-tsp-spid) gathered by your Identity Provider.",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://support.namirial.com/it/supporto-tecnico"
      },
      phone: {
        cta: "chiama",
        action: "003907163494"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.namirialtsp.com/spid/"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://portal.namirialtsp.com/public/retrieveUsername.xhtml"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://portal.namirialtsp.com/public/resetPassword.xhtml"
      }
    },
    posteid: {
      description:
        "For problems encountered during the authentication process,  you can reach the support desk of Poste Italiane by selecting  one of the options presented below. \n For further details you can refer to the [FAQ](https://www.poste.it/faq-poste-id.html) gathered by your Identity Provider and the [User Guide](https://posteid.poste.it/risorse/condivise/doc/manuale_operativo.pdf).",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://www.poste.it/scrivici.html"
      },
      phone: {
        cta: "chiama",
        action: "800007777"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://posteid.poste.it"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://posteid.poste.it/recuperocredenziali.shtml"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://posteid.poste.it/recuperocredenziali.shtml"
      }
    },
    sielteid: {
      description:
        "For problems encountered during the authentication process,  you can reach the support desk of Sielte by selecting  one of the options presented below. \n For further details you can refer to the [FAQ](https://www.sielteid.it/faq.html) gathered by your Identity Provider and the [User Guide](https://www.sielteid.it/faq.html).",
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://www.sielteid.it/contact.html#blocco-contatti-form"
      },
      phone: {
        cta: "chiama",
        action: "00390957171301"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.sielteid.it/che-cos-e-sielteid.html"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://myid.sieltecloud.it/profile/forgotPassword"
      }
    },
    spiditalia: {
      description:
        "For problems encountered during the authentication process,  you can reach the support desk of Sielte by selecting  the button below. \n For further details you can refer to the [FAQ](https://www.register.it/spid#pgc-23051-10-0) gathered by your Identity Provider and the [User Guide](https://spid.register.it/doc/Guida_Utente_SPID.pdf).",
      phone: {
        cta: "chiama",
        action: "+390355787979"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.register.it/spid/ "
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://spid.register.it/selfcare/recovery/username "
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://spid.register.it/selfcare/recovery/password"
      }
    },
    timid: {
      description:
        "For problems encountered during the authentication process,  you can reach the support desk of Tim by selecting  one of the options presented below. \n For further details you can refer to the [User Guide](https://www.trusttechnologies.it/wp-content/uploads/SPIDPRIN.TT_.DPMU15000.03-Guida-Utente-al-servizio-TIM-ID.pdf).",
      email: {
        cta: "invia un'e-mail",
        action: "supportotimid@telecomitalia.it"
      },
      helpdesk_form: {
        cta: "apri un ticket",
        action: "https://www.trusttechnologies.it/contatti/#form"
      },
      phone: {
        cta: "chiama",
        action: "800405800"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://spid.tim.it/tim-id-portal"
      },
      recover_username: {
        cta: "Recupera l'username",
        action: "https://login.id.tim.it/mps/fu.php"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://login.id.tim.it/mps/fp.php"
      }
    },
    cie: {
      description: "The selected provider is used for development purposes.",
      email: {
        cta: "invia un'e-mail",
        action: "fake@email.it"
      },
      phone: {
        cta: "chiama",
        action: "00000000"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.pagopa.gov.it/it/pagopa-spa/"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://www.pagopa.gov.it/it/pagopa-spa/"
      }
    },
    test: {
      description: "The selected provider is used for development purposes.",
      email: {
        cta: "invia un'e-mail",
        action: "fake@email.it"
      },
      phone: {
        cta: "chiama",
        action: "00000000"
      },
      web_site: {
        cta: "Vai al sito web",
        action: "https://www.pagopa.gov.it/it/pagopa-spa/"
      },
      recover_password: {
        cta: "Recupera la password",
        action: "https://www.pagopa.gov.it/it/pagopa-spa/"
      }
    }
  }
};

export const idps = validatePayload(IdpsTextData, mockIdps);
