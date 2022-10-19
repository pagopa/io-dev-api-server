import { Router } from "express";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { qtspClauses } from "../../../payloads/features/fci/qtsp-clauses";
import {
  signatureDetailView,
  signatureRequestDetailView,
  SIGNATURE_ID,
  SIGNATURE_REQUEST_ID
} from "../../../payloads/features/fci/signature-request";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";

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
        signatureReqId === SIGNATURE_REQUEST_ID
          ? O.some(signatureReqId)
          : O.none
      ),
      O.fold(
        // No signatureRequestId was found return a 404
        () => res.sendStatus(400),
        _ => {
          return res.status(200).json(signatureRequestDetailView);
        }
      )
    );
  }
);

addHandler(fciRouter, "get", addFciPrefix("/qtsp/clauses"), (_, res) => {
  res.status(200).json(qtspClauses);
});

addHandler(
  fciRouter,
  "get",
  addFciPrefix("/signatures/:signatureId"),
  (req, res) => {
    pipe(
      O.fromNullable(req.params["signatureId"]),
      O.chain(signatureId =>
        signatureId === SIGNATURE_ID ? O.some(signatureId) : O.none
      ),
      O.fold(
        // No signatureId was found return a 404
        () => res.sendStatus(400),
        _ => {
          return res.status(200).json(signatureDetailView);
        }
      )
    );
  }
);

addHandler(fciRouter, "post", addFciPrefix("/signatures"), (_, res) => {
  res.status(200).json(signatureDetailView);
});
