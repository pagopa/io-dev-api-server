import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CreateSignatureBody } from "../../../../generated/definitions/fci/CreateSignatureBody";
import { DocumentSignature } from "../../../../generated/definitions/fci/DocumentSignature";
import { QtspClausesMetadata } from "../../../../generated/definitions/fci/QtspClausesMetadata";
import { qtspClauses } from "./qtsp-clauses";
import { documents, SIGNATURE_REQUEST_ID } from "./signature-request";
import {
  ClausesSignature,
  TypeEnum as ClauseSignatureType
} from "../../../../generated/definitions/fci/ClausesSignature";

const documentSignatures: DocumentSignature[] = [
  {
    documentId: documents[0].id,
    signature: "",
    clauses: [
      {
        signatureFieldData: "signatureField1",
        type: ClauseSignatureType.fieldName
      } as ClausesSignature,
      {
        signatureFieldData: "signatureField2",
        type: ClauseSignatureType.fieldName
      } as ClausesSignature
    ]
  },
  {
    documentId: documents[1].id,
    signature: "",
    clauses: [
      {
        signatureFieldData: "signatureField1",
        type: ClauseSignatureType.fieldName
      } as ClausesSignature,
      {
        signatureFieldData: "signatureField2",
        type: ClauseSignatureType.fieldName
      } as ClausesSignature
    ]
  }
] as DocumentSignature[];

export const createSignatureBody: CreateSignatureBody = {
  signatureRequestId: SIGNATURE_REQUEST_ID,
  documentSignatures,
  publicKeyDigest: "" as NonEmptyString,
  timestamp: new Date(),
  qtspClauses: {
    acceptedClauses: qtspClauses.clauses,
    mrcDocumentUrl: qtspClauses.mrcDocumentUrl,
    signature: ""
  } as QtspClausesMetadata
};
