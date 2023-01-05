import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { QtspClause } from "../../../../generated/definitions/fci/QtspClause";
import { QtspClausesMetadataDetailView } from "../../../../generated/definitions/fci/QtspClausesMetadataDetailView";

export const qtspClauses: QtspClausesMetadataDetailView = {
  clauses: [
    {
      text:
        "Dichiaro quanto indicato nel [Quadro E - Autocertificazione e sottoscrizione da parte del titolare](@DOCUMENT_URL)"
    } as QtspClause,
    {
      text:
        "Accetto le Condizioni Generali di [Contratto](https://docs.namirialtsp.com/documents/Mod_NAM_CA01D_ITA.pdf) (Mod.NAM CA01) e le clausole vessatorie riportate nel [Quadro F – Clausole vessatorie](@DOCUMENT_URL)"
    } as QtspClause
  ],
  document_url:
    "https://pagopa.demo.bit4id.org/static/docs/modulo_richiesta_V1.pdf",
  nonce: "nonceMockedBase64" as NonEmptyString,
  privacy_url: "https://docs.namirialtsp.com/documents/Mod_NAM_GDPR03D_ITA.pdf",
  privacy_text: "Confermo di aver letto l’[informativa sul trattamento dei dati personali](@PRIVACY_URL)" as NonEmptyString,
  terms_and_conditions_url:
    "https://docs.namirialtsp.com/documents/Mod_NAM_CA01D_ITA.pdf"
};
