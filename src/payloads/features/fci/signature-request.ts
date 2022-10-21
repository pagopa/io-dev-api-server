import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { ulid } from "ulid";
import {
  Clause,
  TypeEnum as ClauseTypeEnum
} from "../../../../generated/definitions/fci/Clause";
import { Document } from "../../../../generated/definitions/fci/Document";
import { DocumentStatusEnum } from "../../../../generated/definitions/fci/DocumentStatus";
import { SignatureRequestDetailView } from "../../../../generated/definitions/fci/SignatureRequestDetailView";
import { SignatureRequestStatusEnum } from "../../../../generated/definitions/fci/SignatureRequestStatus";

export const SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const PRODUCT_ID = ulid() as NonEmptyString;
export const SIGNATURE_ID = ulid() as NonEmptyString;

const now = new Date();
const mockQrCodeUrl = "https://gist.githubusercontent.com/lucacavallaro/a3b9d5305cc6e2c9bdfb6ec1dc28fd96/raw/26799f357ff712396cdbc4f862a13099758e89d3/qr-code.png" as NonEmptyString;

export const documents: Document[] = [
  {
    id: ulid() as NonEmptyString,
    status: DocumentStatusEnum.READY,
    url: "modulo_1.pdf" as NonEmptyString,
    title: "DEMO POC #1" as NonEmptyString,
    clauses: [
      {
        title: "CLAUSOLA 1 DOC 1" as NonEmptyString,
        uniqueName: "Signature1" as NonEmptyString,
        type: ClauseTypeEnum.mandatory
      } as Clause,
      {
        title: "CLAUSOLA 2 DOC 1" as NonEmptyString,
        uniqueName: "Signature2" as NonEmptyString,
        type: ClauseTypeEnum.unfair
      } as Clause,
      {
        title: "CLAUSOLA 3 DOC 1" as NonEmptyString,
        uniqueName: "Signature3" as NonEmptyString,
        type: ClauseTypeEnum.optional
      } as Clause,
      {
        title: "CLAUSOLA 4 DOC 1" as NonEmptyString,
        uniqueName: "Signature4" as NonEmptyString,
        type: ClauseTypeEnum.optional
      } as Clause
    ] as Clause[]
  },
  {
    id: ulid() as NonEmptyString,
    status: DocumentStatusEnum.READY,
    url: "modulo_2.pdf" as NonEmptyString,
    title: "DEMO POC #2" as NonEmptyString,
    clauses: [
      {
        title: "CLAUSOLA 1 DOC 1" as NonEmptyString,
        uniqueName: "Signature1" as NonEmptyString,
        type: ClauseTypeEnum.mandatory
      } as Clause,
      {
        title: "CLAUSOLA 2 DOC 1" as NonEmptyString,
        uniqueName: "Signature2" as NonEmptyString,
        type: ClauseTypeEnum.unfair
      } as Clause,
      {
        title: "CLAUSOLA 3 DOC 1" as NonEmptyString,
        uniqueName: "Signature3" as NonEmptyString,
        type: ClauseTypeEnum.optional
      } as Clause
    ] as Clause[]
  },
  {
    id: ulid() as NonEmptyString,
    status: DocumentStatusEnum.READY,
    url: "modulo_3.pdf" as NonEmptyString,
    title: "DEMO POC #3" as NonEmptyString,
    clauses: [
      {
        title: "CLAUSOLA 1 DOC 5" as NonEmptyString,
        uniqueName: "Signature1" as NonEmptyString,
        type: ClauseTypeEnum.mandatory,
        coords: {
          page: 1,
          x: 17,
          y: 263,
          w: 53,
          h: 11
        }
      } as Clause,
      {
        title: "CLAUSOLA 2 DOC 5" as NonEmptyString,
        uniqueName: "Signature2" as NonEmptyString,
        type: ClauseTypeEnum.optional,
        coords: {
          page: 1,
          x: 17,
          y: 203,
          w: 53,
          h: 11
        }
      } as Clause,
      {
        title: "CLAUSOLA 3 DOC 5" as NonEmptyString,
        uniqueName: "Signature3" as NonEmptyString,
        type: ClauseTypeEnum.mandatory,
        coords: {
          page: 1,
          x: 118,
          y: 263,
          w: 53,
          h: 11
        }
      } as Clause,
      {
        title: "CLAUSOLA 4 DOC 5" as NonEmptyString,
        uniqueName: "Signature4" as NonEmptyString,
        type: ClauseTypeEnum.mandatory,
        coords: {
          page: 2,
          x: 25,
          y: 263,
          w: 53,
          h: 11
        }
      } as Clause,
      {
        title: "CLAUSOLA 5 DOC 5" as NonEmptyString,
        uniqueName: "Signature5" as NonEmptyString,
        type: ClauseTypeEnum.optional,
        coords: {
          page: 2,
          x: 25,
          y: 186,
          w: 53,
          h: 11
        }
      } as Clause,
      {
        title: "CLAUSOLA 6 DOC 5" as NonEmptyString,
        uniqueName: "Signature6" as NonEmptyString,
        type: ClauseTypeEnum.mandatory,
        coords: {
          page: 3,
          x: 25,
          y: 153,
          w: 53,
          h: 11
        }
      } as Clause
    ] as Clause[]
  },
  {
    id: ulid() as NonEmptyString,
    status: DocumentStatusEnum.READY,
    url: "modulo_4.pdf" as NonEmptyString,
    title: "DEMO POC #4" as NonEmptyString,
    clauses: [
      {
        title: "CLAUSOLA 1 DOC 4" as NonEmptyString,
        uniqueName: "Signature1" as NonEmptyString,
        type: ClauseTypeEnum.mandatory
      } as Clause,
      {
        title: "CLAUSOLA 1 DOC 4" as NonEmptyString,
        uniqueName: "Signature2" as NonEmptyString,
        type: ClauseTypeEnum.optional
      } as Clause
    ] as Clause[]
  },
  {
    id: ulid() as NonEmptyString,
    status: DocumentStatusEnum.READY,
    url: "modulo_5.pdf" as NonEmptyString,
    title: "DEMO POC #5" as NonEmptyString,
    clauses: [
      {
        title: "CLAUSOLA 1 DOC 5" as NonEmptyString,
        uniqueName: "Signature1" as NonEmptyString,
        type: ClauseTypeEnum.mandatory
      } as Clause,
      {
        title: "CLAUSOLA 2 DOC 5" as NonEmptyString,
        uniqueName: "Signature2" as NonEmptyString,
        type: ClauseTypeEnum.optional
      } as Clause,
      {
        title: "CLAUSOLA 3 DOC 5" as NonEmptyString,
        uniqueName: "Signature3" as NonEmptyString,
        type: ClauseTypeEnum.mandatory
      } as Clause,
      {
        title: "CLAUSOLA 4 DOC 5" as NonEmptyString,
        uniqueName: "Signature4" as NonEmptyString,
        type: ClauseTypeEnum.mandatory
      } as Clause,
      {
        title: "CLAUSOLA 5 DOC 5" as NonEmptyString,
        uniqueName: "Signature5" as NonEmptyString,
        type: ClauseTypeEnum.optional
      } as Clause,
      {
        title: "CLAUSOLA 6 DOC 5" as NonEmptyString,
        uniqueName: "Signature6" as NonEmptyString,
        type: ClauseTypeEnum.mandatory
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
