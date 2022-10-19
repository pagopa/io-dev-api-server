import { QtspClause } from "../../../../generated/definitions/fci/QtspClause";
import { QtspClauses } from "../../../../generated/definitions/fci/QtspClauses";

export const qtspClauses: QtspClauses = {
  clauses: [
    {
      text:
        "(1) Io sottoscritto/a dichiaro quanto indicato nel QUADRO E - AUTOCERTIFICAZIONE E SOTTOSCRIZIONE DA PARTE DEL TITOLARE."
    } as QtspClause,
    {
      text:
        "(2) Io sottoscritto/a accetto le Condizioni Generali di Contratto (Mod.NAM CA01) e le clausole vessatorie riportate nel QUADRO F – CLAUSOLE VESSATORIE"
    } as QtspClause,
    {
      text:
        "(3) Io sottoscritto/a acconsento al trattamento dei dati personali come specificato nel QUADRO G - CONSENSO AL TRATTAMENTO DEI DATI PERSONALI"
    } as QtspClause
  ],
  mrcDocumentUrl:
    "https://pagopa.demo.bit4id.org/static/docs/modulo_richiesta_V1.pdf",
  privacyDocumentUrl:
    "https://docs.namirialtsp.com/documents/Mod_NAM_GDPR03D_ITA.pdf",
  tosDocumentUrl: "https://docs.namirialtsp.com/documents/Mod_NAM_CA01D_ITA.pdf"
};
