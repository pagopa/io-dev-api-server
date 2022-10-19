import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { ulid } from "ulid";
import { QtspClausesMetadata } from "../../../../generated/definitions/fci/QtspClausesMetadata";
import { SignatureDetailView } from "../../../../generated/definitions/fci/SignatureDetailView";
import { SignatureRequestDetailView } from "../../../../generated/definitions/fci/SignatureRequestDetailView";
import { SignatureRequestStatusEnum } from "../../../../generated/definitions/fci/SignatureRequestStatus";
import { Document } from "../../../../generated/definitions/fci/Document";
import { Clause } from "../../../../generated/definitions/fci/Clause";

export const SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const PRODUCT_ID = ulid() as NonEmptyString;
export const SIGNATURE_ID = ulid() as NonEmptyString;

const now = new Date();
const mockQrCodeUrl = "https://gist.githubusercontent.com/lucacavallaro/a3b9d5305cc6e2c9bdfb6ec1dc28fd96/raw/26799f357ff712396cdbc4f862a13099758e89d3/qr-code.png" as NonEmptyString;

export const documents: Document[] = [
  {
    id: ulid() as NonEmptyString,
    url: "" as NonEmptyString,
    title: "DEMO POC #1" as NonEmptyString,
    clauses: [
      {
        title: "CLAUSOLA 1 DOC 1" as NonEmptyString,
        signatureFieldId: "signatureField1" as NonEmptyString,
        required: true
      } as Clause,
      {
        title: "CLAUSOLA 2 DOC 1" as NonEmptyString,
        signatureFieldId: "signatureField2" as NonEmptyString,
        required: true
      } as Clause
    ] as Clause[]
  },
  {
    id: ulid() as NonEmptyString,
    url: "" as NonEmptyString,
    title: "DEMO POC #2" as NonEmptyString,
    clauses: [
      {
        title: "CLAUSOLA 1 DOC 2" as NonEmptyString,
        signatureFieldId: "signatureField1" as NonEmptyString,
        required: true
      } as Clause,
      {
        title: "CLAUSOLA 2 DOC 2" as NonEmptyString,
        signatureFieldId: "signatureField2" as NonEmptyString,
        required: true
      } as Clause
    ] as Clause[]
  }
];

export const signatureRequestDetailView: SignatureRequestDetailView = {
  id: SIGNATURE_REQUEST_ID,
  status: SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE,
  productId: PRODUCT_ID,
  expiresAt: new Date(now.getDate() + 1),
  qrCodeUrl: mockQrCodeUrl,
  documents
};

export const signatureDetailView: SignatureDetailView = {
  id: SIGNATURE_ID,
  signatureRequestId: SIGNATURE_REQUEST_ID,
  documentSignatures: [],
  qtspClauses: {} as QtspClausesMetadata
};
