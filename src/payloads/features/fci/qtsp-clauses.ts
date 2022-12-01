import { QtspClause } from "../../../../generated/definitions/fci/QtspClause";
import { QtspClausesMetadata } from "../../../../generated/definitions/fci/QtspClausesMetadata";

export const qtspClauses: QtspClausesMetadata = {
  clauses: [
    {
      text:
        "(1) Io sottoscritto/a dichiaro quanto indicato nel [QUADRO E - AUTOCERTIFICAZIONE E SOTTOSCRIZIONE DA PARTE DEL TITOLARE.](@DOCUMENT_URL)"
    } as QtspClause,
    {
      text:
        "(2) Io sottoscritto/a accetto le Condizioni Generali di Contratto (Mod.NAM CA01) e le clausole vessatorie riportate nel [QUADRO F – CLAUSOLE VESSATORIE](@DOCUMENT_URL)"
    } as QtspClause
  ],
  document_url:
    "https://pagopa.demo.bit4id.org/static/docs/modulo_richiesta_V1.pdf",
  nonce: "nonceMocked",
  privacy_url: "https://docs.namirialtsp.com/documents/Mod_NAM_GDPR03D_ITA.pdf",
  privacy_text:
    "Presa visione dell'informativa sul trattamento dei dati personali.",
  terms_and_conditions_url:
    "https://docs.namirialtsp.com/documents/Mod_NAM_CA01D_ITA.pdf"
};
