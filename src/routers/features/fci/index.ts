import { Router } from "express";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { isEqual } from "lodash";
import { ioDevServerConfig, staticContentRootPath } from "../../../config";
import { qtspClauses } from "../../../payloads/features/fci/qtsp-clauses";
import { qtspFilledDocument } from "../../../payloads/features/fci/qtsp-filled-document";
import { mockSignatureDetailView } from "../../../payloads/features/fci/signature-detail-request";
import {
  EXPIRED_SIGNATURE_REQUEST_ID,
  NO_FIELDS_SIGNATURE_REQUEST_ID,
  REJECTED_SIGNATURE_REQUEST_ID,
  SIGNATURE_REQUEST_ID,
  signatureRequestDetailViewDoc,
  SIGNED_EXPIRED_SIGNATURE_REQUEST_ID,
  SIGNED_SIGNATURE_REQUEST_ID,
  WAIT_QTSP_SIGNATURE_REQUEST_ID
} from "../../../payloads/features/fci/signature-request";
import { addHandler } from "../../../payloads/response";
import { sendFile } from "../../../utils/file";
import { addApiV1Prefix } from "../../../utils/strings";
import { mockFciMetadata } from "../../../payloads/features/fci/metadata";
import { SignatureRequestStatusEnum } from "../../../../generated/definitions/fci/SignatureRequestStatus";
import { signatureRequestList } from "../../../payloads/features/fci/signature-requests";
import { getProblemJson } from "../../../payloads/error";

export const fciRouter = Router();
const configResponse = ioDevServerConfig.messages.fci.response;

export const addFciPrefix = (path: string) => addApiV1Prefix(`/sign${path}`);

addHandler(
  fciRouter,
  "get",
  addFciPrefix("/signature-requests/:signatureRequestId"),
  (req, res) => {
    const signatureRequestId = "signatureRequestId";
    const now = new Date();
    pipe(
      O.fromNullable(req.params[signatureRequestId]),
      O.chain(signatureReqId =>
        (signatureReqId === SIGNATURE_REQUEST_ID ||
          signatureReqId === EXPIRED_SIGNATURE_REQUEST_ID ||
          signatureReqId === WAIT_QTSP_SIGNATURE_REQUEST_ID ||
          signatureReqId === SIGNED_SIGNATURE_REQUEST_ID ||
          signatureReqId === SIGNED_EXPIRED_SIGNATURE_REQUEST_ID ||
          signatureReqId === REJECTED_SIGNATURE_REQUEST_ID ||
          signatureReqId === NO_FIELDS_SIGNATURE_REQUEST_ID) &&
        configResponse.getFciResponseCode === 200
          ? O.some(signatureReqId)
          : O.none
      ),
      O.fold(
        // No signatureRequestId was found return an error based on response code
        () =>
          pipe(
            configResponse.getFciResponseCode,
            O.of,
            O.filter(responseCode => responseCode !== 200),
            O.map(responseCode =>
              res.status(responseCode).json(getProblemJson(responseCode))
            ),
            O.getOrElse(() => res.sendStatus(404)) // No response code was found return 404 as default
          ),
        signatureReqId =>
          res.status(200).json(
            signatureReqId === SIGNATURE_REQUEST_ID
              ? signatureRequestDetailViewDoc
              : signatureReqId === EXPIRED_SIGNATURE_REQUEST_ID
              ? {
                  ...signatureRequestDetailViewDoc,
                  id: EXPIRED_SIGNATURE_REQUEST_ID,
                  expires_at: new Date(now.setDate(now.getDate() - 30)),
                  status: SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE
                }
              : signatureReqId === WAIT_QTSP_SIGNATURE_REQUEST_ID
              ? {
                  ...signatureRequestDetailViewDoc,
                  id: WAIT_QTSP_SIGNATURE_REQUEST_ID,
                  status: SignatureRequestStatusEnum.WAIT_FOR_QTSP
                }
              : signatureReqId === SIGNED_EXPIRED_SIGNATURE_REQUEST_ID
              ? {
                  ...signatureRequestDetailViewDoc,
                  id: SIGNED_EXPIRED_SIGNATURE_REQUEST_ID,
                  updated_at: new Date(now.setDate(now.getDate() - 91)),
                  status: SignatureRequestStatusEnum.SIGNED
                }
              : signatureReqId === REJECTED_SIGNATURE_REQUEST_ID
              ? {
                  ...signatureRequestDetailViewDoc,
                  id: REJECTED_SIGNATURE_REQUEST_ID,
                  updated_at: new Date(now.setDate(now.getDate() - 91)),
                  status: SignatureRequestStatusEnum.REJECTED
                }
              : signatureReqId === NO_FIELDS_SIGNATURE_REQUEST_ID
              ? {
                  ...signatureRequestDetailViewDoc,
                  status: SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE,
                  documents: signatureRequestDetailViewDoc.documents.map(d => ({
                    ...d,
                    metadata: { ...d.metadata, signature_fields: [] }
                  }))
                }
              : {
                  ...signatureRequestDetailViewDoc,
                  id: SIGNED_SIGNATURE_REQUEST_ID,
                  status: SignatureRequestStatusEnum.SIGNED
                }
          )
      )
    );
  }
);

addHandler(fciRouter, "get", addFciPrefix("/qtsp/clauses"), (_, res) => {
  res.status(200).json(qtspClauses);
});

addHandler(
  fciRouter,
  "post",
  addFciPrefix("/qtsp/clauses/filled_document"),
  (req, res) => {
    pipe(
      O.fromNullable(req.body),
      O.chain(cb => (isEqual(cb, {}) ? O.none : O.some(cb))),
      O.fold(
        () => res.sendStatus(400),
        _ => res.status(201).json(qtspFilledDocument)
      )
    );
  }
);

addHandler(fciRouter, "post", addFciPrefix("/signatures"), (req, res) => {
  pipe(
    O.fromNullable(req.body),
    O.chain(cb => (isEqual(cb, {}) ? O.none : O.some(cb))),
    O.fold(
      () => res.sendStatus(400),
      _ => res.status(200).json(mockSignatureDetailView)
    )
  );
});

addHandler(
  fciRouter,
  "get",
  `${staticContentRootPath}/fci/:filename`,
  (req, res) => {
    sendFile(`assets/fci/pdf/${req.params.filename}.pdf`, res);
  }
);

addHandler(fciRouter, "get", addFciPrefix("/metadata"), (_, res) => {
  res.status(200).json(mockFciMetadata);
});

addHandler(fciRouter, "get", addFciPrefix("/signature-requests"), (_, res) => {
  res.status(200).json(signatureRequestList);
});
