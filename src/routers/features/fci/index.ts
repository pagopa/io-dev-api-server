import { Router } from "express";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { isEqual } from "lodash";
import { staticContentRootPath } from "../../../config";
import { qtspClauses } from "../../../payloads/features/fci/qtsp-clauses";
import { qtspFilledDocument } from "../../../payloads/features/fci/qtsp-filled-document";
import {
  EXPIRED_SIGNATURE_REQUEST_ID,
  SIGNATURE_REQUEST_ID,
  signatureRequestDetailViewDoc,
  WAIT_QTSP_SIGNATURE_REQUEST_ID,
  SIGNED_SIGNATURE_REQUEST_ID
} from "../../../payloads/features/fci/signature-request";
import { StatusEnum as SignatureRequestStatus } from "../../../../generated/definitions/fci/SignatureRequestDetailView";
import { addHandler } from "../../../payloads/response";
import { sendFile } from "../../../utils/file";
import { addApiV1Prefix } from "../../../utils/strings";
import { mockSignatureDetailView } from "../../../payloads/features/fci/signature-detail-request";

export const fciRouter = Router();

export const addFciPrefix = (path: string) => addApiV1Prefix(`/sign${path}`);

const now = new Date();

addHandler(
  fciRouter,
  "get",
  addFciPrefix("/signature-requests/:signatureRequestId"),
  (req, res) => {
    const signatureRequestId = "signatureRequestId";
    pipe(
      O.fromNullable(req.params[signatureRequestId]),
      O.chain(signatureReqId =>
        signatureReqId === SIGNATURE_REQUEST_ID ||
        signatureReqId === EXPIRED_SIGNATURE_REQUEST_ID ||
        signatureReqId === WAIT_QTSP_SIGNATURE_REQUEST_ID ||
        signatureReqId === SIGNED_SIGNATURE_REQUEST_ID
          ? O.some(signatureReqId)
          : O.none
      ),
      O.fold(
        // No signatureRequestId was found return a 404
        () => res.sendStatus(400),
        signatureReqId =>
          res.status(200).json(
            signatureReqId === SIGNATURE_REQUEST_ID
              ? signatureRequestDetailViewDoc
              : signatureReqId === EXPIRED_SIGNATURE_REQUEST_ID
              ? {
                  ...signatureRequestDetailViewDoc,
                  id: EXPIRED_SIGNATURE_REQUEST_ID,
                  expires_at: new Date(now.setDate(now.getDate() - 30))
                }
              : signatureReqId === WAIT_QTSP_SIGNATURE_REQUEST_ID
              ? {
                  ...signatureRequestDetailViewDoc,
                  id: WAIT_QTSP_SIGNATURE_REQUEST_ID,
                  status: SignatureRequestStatus.WAIT_FOR_QTSP
                }
              : {
                  ...signatureRequestDetailViewDoc,
                  id: SIGNED_SIGNATURE_REQUEST_ID,
                  status: SignatureRequestStatus.SIGNED
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
