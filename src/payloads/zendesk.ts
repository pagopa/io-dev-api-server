import { Zendesk } from "../../generated/definitions/content/Zendesk";

export const zendeskConfig: Zendesk = {
  panicMode: false,
  zendeskCategories: {
    id: "1900002821093",
    categories: [
      {
        value: "Certificazione Verde COVID-19",
        description: {
          "it-IT": "Certificazione Verde COVID-19",
          "en-EN": "COVID-19 Green Certification"
        },
        zendeskSubCategories: {
          id: "360027411097",
          subCategories: [
            {
              value: "Informazioni generali",
              description: {
                "it-IT": "Informazioni generali",
                "en-EN": "General informations"
              }
            },
            {
              value: "Non ho ricevuto nulla",
              description: {
                "it-IT": "Non ho ricevuto nulla",
                "en-EN": "I have not received anything"
              }
            },
            {
              value: "Problemi tecnici su IO",
              description: {
                "it-IT": "Problemi tecnici su IO",
                "en-EN": "Technical problems on IO"
              }
            }
          ]
        }
      },
      {
        value: "Generali",
        description: {
          "it-IT": "Generali",
          "en-EN": "General"
        }
      }
    ]
  }
};
