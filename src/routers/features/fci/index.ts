import { Router } from "express";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { qtspClauses } from "../../../payloads/features/fci/qtsp-clauses";
import {
  EXPIRED_SIGNATURE_REQUEST_ID,
  signatureRequestDetailView,
  signatureRequestDetailViewExpired,
  signatureRequestDetailViewWaitQtsp,
  SIGNATURE_REQUEST_ID,
  WAIT_QTSP_SIGNATURE_REQUEST_ID
} from "../../../payloads/features/fci/signature-request";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";
import { isEqual } from "lodash";
import { staticContentRootPath } from "../../../config";
import { sendFile } from "../../../utils/file";
import { qtspFilledDocument } from "../../../payloads/features/fci/qtsp_filled_document";

export const fciRouter = Router();

export const addFciPrefix = (path: string) => addApiV1Prefix(`/sign${path}`);

addHandler(
  fciRouter,
  "get",
  addFciPrefix("/signature-requests/:signatureRequestId"),
  (req, res) => {
    pipe(
      O.fromNullable(req.params["signatureRequestId"]),
      O.chain(signatureReqId =>
        signatureReqId === SIGNATURE_REQUEST_ID ||
        signatureReqId === EXPIRED_SIGNATURE_REQUEST_ID ||
        signatureReqId === WAIT_QTSP_SIGNATURE_REQUEST_ID
          ? O.some(signatureReqId)
          : O.none
      ),
      O.fold(
        // No signatureRequestId was found return a 404
        () => res.sendStatus(400),
        signatureReqId =>
          res
            .status(200)
            .json(
              signatureReqId === SIGNATURE_REQUEST_ID
                ? signatureRequestDetailView
                : signatureReqId === EXPIRED_SIGNATURE_REQUEST_ID
                ? signatureRequestDetailViewExpired
                : signatureRequestDetailViewWaitQtsp
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
  addFciPrefix("/qtsp/clause/filled_documents"),
  (_, res) => {
    res.status(200).json(qtspFilledDocument);
  }
);

addHandler(fciRouter, "post", addFciPrefix("/signatures"), (req, res) => {
  pipe(
    O.fromNullable(req.body),
    O.chain(cb => (isEqual(cb, {}) ? O.none : O.some(cb))),
    O.fold(
      () => res.sendStatus(400),
      _ => res.sendStatus(201)
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
