import { ContextualHelp } from "../../generated/definitions/content/ContextualHelp";
import { validatePayload } from "../utils/validator";

const contextualHelp: ContextualHelp = {
  version: 1,
  it: {
    screens: [
      {
        route_name: "PROFILE_MAIN",
        content: "**content**"
      }
    ],
    idps: {
      arubaid: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Aruba selezionando una delle opzioni disponibili qui.",
        helpdesk_form:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code",
        phone: "003905750504",
        web_site: "https://www.pec.it/richiedi-spid-aruba-id.aspx",
        recover_username: "https://selfcarespid.aruba.it/#/recovery-username",
        recover_password: "https://selfcarespid.aruba.it/#/recovery-password",
        recover_emergency_code:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      },
      infocertid: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da InfoCert  selezionando una delle opzioni disponibili qui di seguito. \n Inoltre, per ulteriori informazioni puoi consultare la [le FAQ e le guide](https://help.infocert.it/Cerca?searchText=spid) fornite dal tuo Identity Provider.",
        helpdesk_form: "https://contatta.infocert.it/ticket/",
        phone: "00390654641489",
        web_site: "https://identitadigitale.infocert.it/",
        recover_username:
          "https://help.infocert.it/home/faq/come-posso-recuperare-la-user-id-di-accesso-alla-mia-identita-digitale",
        recover_password: "https://my.infocert.it/selfcare/#/recoveryPin"
      },
      intesaid: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Intesa  selezionando una delle opzioni disponibili qui di seguito.",
        email: "hdintesa@advalia.com",
        helpdesk_form: "https://www.hda.intesa.it/area-clienti",
        phone: "800805093",
        phone_international: "00390287119396",
        web_site: "https://www.intesa.it/intesaid",
        recover_password:
          "https://spid.intesa.it/area-privata/recupera-password.aspx"
      },
      lepidaid: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Lepida selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare il [Manuale Utente](https://id.lepida.it/docs/manuale_utente.pdf) fornito da tuo Identity Provider.",
        email: "helpdesk@lepida.it",
        helpdesk_form:
          "https://www.lepida.net/assistenza/richiesta-assistenza-lepidaid",
        phone: "800445500",
        web_site: "https://id.lepida.it/idm/app/#lepida-spid-id",
        recover_username: "https://id.lepida.it/lepidaid/recuperausername",
        recover_password: "https://id.lepida.it/lepidaid/recuperapassword"
      },
      namirialid: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Namirial selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare le [FAQ](https://support.namirial.com/it/faq/faq-tsp/faq-tsp-spid) fornite dal tuo Identity Provider.",
        helpdesk_form: "https://support.namirial.com/it/supporto-tecnico",
        phone: "003907163494",
        web_site: "https://www.namirialtsp.com/spid/",
        recover_username:
          "https://portal.namirialtsp.com/public/retrieveUsername.xhtml",
        recover_password:
          "https://portal.namirialtsp.com/public/resetPassword.xhtml"
      },
      posteid: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Poste Italiane  selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare le [FAQ](https://www.poste.it/faq-poste-id.html) fornite dal tuo Identity Provider ed il [Manuale Utente](https://posteid.poste.it/risorse/condivise/doc/manuale_operativo.pdf).",
        helpdesk_form: "https://www.poste.it/scrivici.html",
        phone: "800007777",
        web_site: "https://posteid.poste.it",
        recover_username: "https://posteid.poste.it/recuperocredenziali.shtml",
        recover_password: "https://posteid.poste.it/recuperocredenziali.shtml"
      },
      sielteid: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Sielte  selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare le [FAQ](https://www.sielteid.it/faq.html) fornite dal tuo Identity Provider ed il [Manuale Utente](https://www.sielteid.it/documents/ManualeUtente.pdf).",
        helpdesk_form:
          "https://www.sielteid.it/contact.html#blocco-contatti-form",
        phone: "00390957171301",
        web_site: "https://www.sielteid.it/che-cos-e-sielteid.html",
        recover_password: "https://myid.sieltecloud.it/profile/forgotPassword"
      },
      spiditalia: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Register mediante il bottone qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare le [FAQ](https://www.register.it/spid#pgc-23051-10-0) fornite dal tuo Identity Provider ed il [Manuale Utente](https://spid.register.it/doc/Guida_Utente_SPID.pdf).",
        phone: "+390355787979",
        web_site: "https://www.register.it/spid/ ",
        recover_username:
          "https://spid.register.it/selfcare/recovery/username ",
        recover_password: "https://spid.register.it/selfcare/recovery/password"
      },
      timid: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Tim  selezionando una delle opzioni disponibili qui di seguito. \nInoltre, per ulteriori informazioni puoi consultare il [Manuale Utente](https://www.trusttechnologies.it/wp-content/uploads/SPIDPRIN.TT_.DPMU15000.03-Guida-Utente-al-servizio-TIM-ID.pdf) fornito dal tuo Identity Provider.",
        email: "supportotimid@telecomitalia.it",
        helpdesk_form: "https://www.trusttechnologies.it/contatti/#form",
        phone: "800405800",
        web_site: "https://spid.tim.it/tim-id-portal",
        recover_username: "https://login.id.tim.it/mps/fu.php",
        recover_password: "https://login.id.tim.it/mps/fp.php"
      },
      cie: {
        description: "The selected provider is used for development purposes.",
        email: "fake@email.it",
        phone: "00000000",
        web_site: "https://www.pagopa.gov.it/it/pagopa-spa/",
        recover_password: "https://www.pagopa.gov.it/it/pagopa-spa/"
      },
      test: {
        description: "The selected provider is used for development purposes.",
        email: "fake@email.it",
        phone: "00000000",
        web_site: "https://www.pagopa.gov.it/it/pagopa-spa/",
        recover_password: "https://www.pagopa.gov.it/it/pagopa-spa/"
      }
    }
  },
  en: {
    screens: [
      {
        route_name: "PROFILE_MAIN",
        content: "**content**"
      }
    ],
    idps: {
      arubaid: {
        description:
          "For problems encountered during the authentication process , you can reach the support desk of Aruba by selecting  one of the options presented below.",
        helpdesk_form:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code",
        phone: "003905750504",
        web_site: "https://www.pec.it/richiedi-spid-aruba-id.aspx",
        recover_username: "https://selfcarespid.aruba.it/#/recovery-username",
        recover_password: "https://selfcarespid.aruba.it/#/recovery-password",
        recover_emergency_code:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      },
      infocertid: {
        description:
          "For problems encountered during the authentication process,  you can reach the support desk of InfoCert by selecting  one of the options presented below. \n For further details you can refer to the [FAQ](https://help.infocert.it/Cerca?searchText=spid) gathered by your Identity Provider.",
        helpdesk_form: "https://contatta.infocert.it/ticket/",
        phone: "00390654641489",
        web_site: "https://identitadigitale.infocert.it/",
        recover_username:
          "https://help.infocert.it/home/faq/come-posso-recuperare-la-user-id-di-accesso-alla-mia-identita-digitale",
        recover_password: "https://my.infocert.it/selfcare/#/recoveryPin"
      },
      intesaid: {
        description:
          "For problems encountered during the authentication process,  you can reach the support desk of Intesa by selecting  one of the options presented below.",
        email: "hdintesa@advalia.com",
        helpdesk_form: "https://www.hda.intesa.it/area-clienti",
        phone: "800805093",
        phone_international: "00390287119396",
        web_site: "https://www.intesa.it/intesaid",
        recover_password:
          "https://spid.intesa.it/area-privata/recupera-password.aspx"
      },
      lepidaid: {
        description:
          "For problems encountered during the authentication process,  you can reach the support desk of Lepida by selecting  one of the options presented below. \n For further details you can refer to the [User Guide](https://id.lepida.it/docs/manuale_utente.pdf).",
        email: "helpdesk@lepida.it",
        helpdesk_form:
          "https://www.lepida.net/assistenza/richiesta-assistenza-lepidaid",
        phone: "800445500",
        web_site: "https://id.lepida.it/idm/app/#lepida-spid-id",
        recover_username: "https://id.lepida.it/lepidaid/recuperausername",
        recover_password: "https://id.lepida.it/lepidaid/recuperapassword"
      },
      namirialid: {
        description:
          "For problems encountered during the authentication process,  you can reach the support desk of Namirial by selecting  one of the options presented below. \n For further details you can refer to the [FAQ](https://support.namirial.com/it/faq/faq-tsp/faq-tsp-spid) gathered by your Identity Provider.",
        helpdesk_form: "https://support.namirial.com/it/supporto-tecnico",
        phone: "003907163494",
        web_site: "https://www.namirialtsp.com/spid/",
        recover_username:
          "https://portal.namirialtsp.com/public/retrieveUsername.xhtml",
        recover_password:
          "https://portal.namirialtsp.com/public/resetPassword.xhtml"
      },
      posteid: {
        description:
          "For problems encountered during the authentication process,  you can reach the support desk of Poste Italiane by selecting  one of the options presented below. \n For further details you can refer to the [FAQ](https://www.poste.it/faq-poste-id.html) gathered by your Identity Provider and the [User Guide](https://posteid.poste.it/risorse/condivise/doc/manuale_operativo.pdf).",
        helpdesk_form: "https://www.poste.it/scrivici.html",
        phone: "800007777",
        web_site: "https://posteid.poste.it",
        recover_username: "https://posteid.poste.it/recuperocredenziali.shtml",
        recover_password: "https://posteid.poste.it/recuperocredenziali.shtml"
      },
      sielteid: {
        description:
          "For problems encountered during the authentication process,  you can reach the support desk of Sielte by selecting  one of the options presented below. \n For further details you can refer to the [FAQ](https://www.sielteid.it/faq.html) gathered by your Identity Provider and the [User Guide](https://www.sielteid.it/faq.html).",
        helpdesk_form:
          "https://www.sielteid.it/contact.html#blocco-contatti-form",
        phone: "00390957171301",
        web_site: "https://www.sielteid.it/che-cos-e-sielteid.html",
        recover_password: "https://myid.sieltecloud.it/profile/forgotPassword"
      },
      spiditalia: {
        description:
          "For problems encountered during the authentication process,  you can reach the support desk of Sielte by selecting  the button below. \n For further details you can refer to the [FAQ](https://www.register.it/spid#pgc-23051-10-0) gathered by your Identity Provider and the [User Guide](https://spid.register.it/doc/Guida_Utente_SPID.pdf).",
        phone: "+390355787979",
        web_site: "https://www.register.it/spid/ ",
        recover_username:
          "https://spid.register.it/selfcare/recovery/username ",
        recover_password: "https://spid.register.it/selfcare/recovery/password"
      },
      timid: {
        description:
          "For problems encountered during the authentication process,  you can reach the support desk of Tim by selecting  one of the options presented below. \n For further details you can refer to the [User Guide](https://www.trusttechnologies.it/wp-content/uploads/SPIDPRIN.TT_.DPMU15000.03-Guida-Utente-al-servizio-TIM-ID.pdf).",
        email: "supportotimid@telecomitalia.it",
        helpdesk_form: "https://www.trusttechnologies.it/contatti/#form",
        phone: "800405800",
        web_site: "https://spid.tim.it/tim-id-portal",
        recover_username: "https://login.id.tim.it/mps/fu.php",
        recover_password: "https://login.id.tim.it/mps/fp.php"
      },
      cie: {
        description: "The selected provider is used for development purposes.",
        email: "fake@email.it",
        phone: "00000000",
        web_site: "https://www.pagopa.gov.it/it/pagopa-spa/",
        recover_password: "https://www.pagopa.gov.it/it/pagopa-spa/"
      },
      test: {
        description: "The selected provider is used for development purposes.",
        email: "fake@email.it",
        phone: "00000000",
        web_site: "https://www.pagopa.gov.it/it/pagopa-spa/",
        recover_password: "https://www.pagopa.gov.it/it/pagopa-spa/"
      }
    }
  }
};

export const contextualHelpData = validatePayload(
  ContextualHelp,
  contextualHelp
);
