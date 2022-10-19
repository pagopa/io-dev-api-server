import { CreateSignatureBody } from "../../../../generated/definitions/fci/CreateSignatureBody";
import { DocumentSignature } from "../../../../generated/definitions/fci/DocumentSignature";
import { QtspClausesMetadata } from "../../../../generated/definitions/fci/QtspClausesMetadata";
import { qtspClauses } from "./qtsp-clauses";
import { documents, SIGNATURE_REQUEST_ID } from "./signature-request";

const documentSignature: DocumentSignature[] = [
  {
    documentId: documents[0].id,
    signature: "",
    clauses: [
      {
        signatureFieldId: "signatureField1",
        accepted: true
      },
      {
        signatureFieldId: "signatureField2",
        accepted: true
      }
    ]
  },
  {
    documentId: documents[1].id,
    signature: "",
    clauses: [
      {
        signatureFieldId: "signatureField1",
        accepted: true
      },
      {
        signatureFieldId: "signatureField2",
        accepted: true
      }
    ]
  }
];

export const createSignatureody: CreateSignatureBody = {
  signatureRequestId: SIGNATURE_REQUEST_ID,
  documentSignatures: documentSignature,
  qtspClauses: {
    acceptedClauses: qtspClauses.clauses,
    mrcDocumentUrl: qtspClauses.mrcDocumentUrl,
    signature: ""
  } as QtspClausesMetadata
};
