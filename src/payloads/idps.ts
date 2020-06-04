import { IdpsTextData } from "../../generated/definitions/content/IdpsTextData";
import { validatePayload } from "../utils/validator";

const mockIdps: IdpsTextData = {
  version: 1,
  it: {
    global: {
      title: "**testo** globale",
      sub_title: "### lista \n- item1\n- item2"
    },
    arubaid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    infocertid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    intesaid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    lepidaid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    namirialid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    posteid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    sielteid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    spiditalia: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    timid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    xx_servizicie: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    }
  },
  en: {
    global: {
      title: "**testo** globale",
      sub_title: "### lista \n- item1\n- item2"
    },
    arubaid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    infocertid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    intesaid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    lepidaid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    namirialid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    posteid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    sielteid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    spiditalia: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    timid: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    },
    xx_servizicie: {
      description: "bla bla",
      email: "email@idp.it",
      phone: "5555555",
      web_site: "https://www.idp.it"
    }
  }
};

export const idps = validatePayload(IdpsTextData, mockIdps);
