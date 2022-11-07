import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CreateSignatureBody } from "../../../../generated/definitions/fci/CreateSignatureBody";
import { DocumentSignature } from "../../../../generated/definitions/fci/DocumentSignature";
import { qtspClauses } from "./qtsp-clauses";
import { documents, SIGNATURE_REQUEST_ID } from "./signature-request";
import { QtspClauses } from "../../../../generated/definitions/fci/QtspClauses";
import { SignatureField } from "../../../../generated/definitions/fci/SignatureField";
import { Clause } from "../../../../generated/definitions/fci/Clause";
import { ClausesTypeEnum } from "../../../../generated/definitions/fci/ClausesType";

const documentSignatures: DocumentSignature[] = [
  {
    document_id: documents[0].id,
    signature: "",
    signature_fields: documents[0].metadata.signature_fields
  },
  {
    document_id: documents[1].id,
    signature: "",
    signature_fields: documents[1].metadata.signature_fields
  },
  {
    document_id: documents[2].id,
    signature: "",
    signature_fields: documents[2].metadata.signature_fields
  },
  {
    document_id: documents[3].id,
    signature: "",
    signature_fields: documents[3].metadata.signature_fields
  },
  {
    document_id: documents[4].id,
    signature: "",
    signature_fields: documents[4].metadata.signature_fields
  }
] as DocumentSignature[];

export const createSignatureBody: CreateSignatureBody = {
  signature_request_id: SIGNATURE_REQUEST_ID,
  document_signatures: documentSignatures,
  public_key_digest: "" as NonEmptyString,
  qtsp_clauses: {
    accepted_clauses: qtspClauses.clauses,
    filled_document_url: "",
    signature: "",
    tos_signature_timestamp: new Date()
  } as QtspClauses
};
