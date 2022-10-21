import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CreateSignatureBody } from "../../../../generated/definitions/fci/CreateSignatureBody";
import { DocumentSignature } from "../../../../generated/definitions/fci/DocumentSignature";
import { QtspClausesMetadata } from "../../../../generated/definitions/fci/QtspClausesMetadata";
import { qtspClauses } from "./qtsp-clauses";
import { documents, SIGNATURE_REQUEST_ID } from "./signature-request";
import { ClausesSignature } from "../../../../generated/definitions/fci/ClausesSignature";

const documentSignatures: DocumentSignature[] = [
  {
    documentId: documents[0].id,
    signature: "",
    clauses: [
      {
        signatureFieldId: "signatureField1",
        accepted: true
      } as ClausesSignature,
      {
        signatureFieldId: "signatureField2",
        accepted: true
      } as ClausesSignature
    ]
  },
  {
    documentId: documents[1].id,
    signature: "",
    clauses: [
      {
        signatureFieldId: "signatureField1",
        accepted: true
      } as ClausesSignature,
      {
        signatureFieldId: "signatureField2",
        accepted: true
      } as ClausesSignature
    ]
  }
] as DocumentSignature[];

export const createSignatureBody: CreateSignatureBody = {
  signatureRequestId: SIGNATURE_REQUEST_ID,
  documentSignatures,
  publicKeyDigest: "" as NonEmptyString,
  qtspClauses: {
    acceptedClauses: qtspClauses.clauses,
    mrcDocumentUrl: qtspClauses.mrcDocumentUrl,
    signature: ""
  } as QtspClausesMetadata
};
