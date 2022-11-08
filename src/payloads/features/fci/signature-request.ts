import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { ulid } from "ulid";
import { ClausesTypeEnum } from "../../../../generated/definitions/fci/ClausesType";
import { StatusEnum as DocumentStatusEnum } from "../../../../generated/definitions/fci/Document";
import { DocumentDetailView } from "../../../../generated/definitions/fci/DocumentDetailView";
import { SignatureFieldToBeCreatedAttrs } from "../../../../generated/definitions/fci/SignatureFieldToBeCreatedAttrs";
import {
  SignatureRequestDetailView,
  StatusEnum as SignatureRequestStatus
} from "../../../../generated/definitions/fci/SignatureRequestDetailView";

export const SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const EXPIRED_SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const WAIT_QTSP_SIGNATURE_REQUEST_ID = ulid() as NonEmptyString;
export const DOSSIER_ID = ulid() as NonEmptyString;
export const SIGNATURE_ID = ulid() as NonEmptyString;

const now = new Date();
const mockQrCodeUrl = "https://gist.githubusercontent.com/lucacavallaro/a3b9d5305cc6e2c9bdfb6ec1dc28fd96/raw/26799f357ff712396cdbc4f862a13099758e89d3/qr-code.png" as NonEmptyString;

export const documents: DocumentDetailView[] = [
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: "modulo_1.pdf" as NonEmptyString,
    updated_at: new Date(),
    uploaded_at: new Date(),
    status: DocumentStatusEnum.READY,
    metadata: {
      title: "DEMO POC #1",
      signature_fields: [
        {
          attrs: {
            unique_name: "Signature1"
          },
          clause: {
            title: "CLAUSOLA 1 DOC 1" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature2"
          },
          clause: {
            title: "CLAUSOLA 2 DOC 1" as NonEmptyString,
            type: ClausesTypeEnum.UNFAIR
          }
        },
        {
          attrs: {
            unique_name: "Signature3"
          },
          clause: {
            title: "CLAUSOLA 3 DOC 1" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        },
        {
          attrs: {
            unique_name: "Signature4"
          },
          clause: {
            title: "CLAUSOLA 4 DOC 1" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        }
      ]
    }
  },
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: "modulo_2.pdf" as NonEmptyString,
    updated_at: new Date(),
    uploaded_at: new Date(),
    status: DocumentStatusEnum.READY,
    metadata: {
      title: "DEMO POC #2",
      signature_fields: [
        {
          attrs: {
            unique_name: "Signature1"
          },
          clause: {
            title: "CLAUSOLA 1 DOC 2" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature2"
          },
          clause: {
            title: "CLAUSOLA 2 DOC 2" as NonEmptyString,
            type: ClausesTypeEnum.UNFAIR
          }
        },
        {
          attrs: {
            unique_name: "Signature3"
          },
          clause: {
            title: "CLAUSOLA 3 DOC 2" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        }
      ]
    }
  },
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: "modulo_3.pdf" as NonEmptyString,
    updated_at: new Date(),
    uploaded_at: new Date(),
    status: DocumentStatusEnum.READY,
    metadata: {
      title: "DEMO POC #3",
      signature_fields: [
        {
          attrs: {
            coordinates: {
              bottom_left: { x: 17, y: 263 },
              top_right: { x: 0, y: 0 }
            },
            page: 1
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 1 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            coordinates: {
              bottom_left: { x: 17, y: 203 },
              top_right: { x: 0, y: 0 }
            },
            page: 1
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 2 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            coordinates: {
              bottom_left: { x: 118, y: 263 },
              top_right: { x: 0, y: 0 }
            },
            page: 1
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 3 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            coordinates: {
              bottom_left: { x: 25, y: 263 },
              top_right: { x: 0, y: 0 }
            },
            page: 1
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 4 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            coordinates: {
              bottom_left: { x: 25, y: 186 },
              top_right: { x: 0, y: 0 }
            },
            page: 1
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 5 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            coordinates: {
              bottom_left: { x: 25, y: 153 },
              top_right: { x: 0, y: 0 }
            },
            page: 1
          } as SignatureFieldToBeCreatedAttrs,
          clause: {
            title: "CLAUSOLA 6 DOC 3" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        }
      ]
    }
  },
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: "modulo_4.pdf" as NonEmptyString,
    updated_at: new Date(),
    uploaded_at: new Date(),
    status: DocumentStatusEnum.READY,
    metadata: {
      title: "DEMO POC #4",
      signature_fields: [
        {
          attrs: {
            unique_name: "Signature1"
          },
          clause: {
            title: "CLAUSOLA 1 DOC 1" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature2"
          },
          clause: {
            title: "CLAUSOLA 2 DOC 1" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        }
      ]
    }
  },
  {
    id: ulid() as NonEmptyString,
    created_at: new Date(),
    url: "modulo_5.pdf" as NonEmptyString,
    updated_at: new Date(),
    uploaded_at: new Date(),
    status: DocumentStatusEnum.READY,
    metadata: {
      title: "DEMO POC #5",
      signature_fields: [
        {
          attrs: {
            unique_name: "Signature1"
          },
          clause: {
            title: "CLAUSOLA 1 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature2"
          },
          clause: {
            title: "CLAUSOLA 2 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        },
        {
          attrs: {
            unique_name: "Signature3"
          },
          clause: {
            title: "CLAUSOLA 3 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature4"
          },
          clause: {
            title: "CLAUSOLA 4 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        },
        {
          attrs: {
            unique_name: "Signature5"
          },
          clause: {
            title: "CLAUSOLA 5 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.OPTIONAL
          }
        },
        {
          attrs: {
            unique_name: "Signature6"
          },
          clause: {
            title: "CLAUSOLA 6 DOC 5" as NonEmptyString,
            type: ClausesTypeEnum.REQUIRED
          }
        }
      ]
    }
  }
];

export const signatureRequestDetailView: SignatureRequestDetailView = {
  id: SIGNATURE_REQUEST_ID,
  status: SignatureRequestStatus.WAIT_FOR_SIGNATURE,
  created_at: new Date(),
  dossier_id: DOSSIER_ID,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  qr_code_url: mockQrCodeUrl,
  signer_id: SIGNATURE_ID,
  updated_at: new Date(),
  documents
};

export const signatureRequestDetailViewExpired: SignatureRequestDetailView = {
  id: EXPIRED_SIGNATURE_REQUEST_ID,
  status: SignatureRequestStatus.WAIT_FOR_SIGNATURE,
  created_at: new Date(),
  dossier_id: DOSSIER_ID,
  expires_at: new Date(now.setDate(now.getDate() - 30)),
  qr_code_url: mockQrCodeUrl,
  signer_id: SIGNATURE_ID,
  updated_at: new Date(),
  documents
};

export const signatureRequestDetailViewWaitQtsp: SignatureRequestDetailView = {
  id: WAIT_QTSP_SIGNATURE_REQUEST_ID,
  status: SignatureRequestStatus.WAIT_FOR_QTSP,
  created_at: new Date(),
  dossier_id: DOSSIER_ID,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  qr_code_url: mockQrCodeUrl,
  signer_id: SIGNATURE_ID,
  updated_at: new Date(),
  documents
};
