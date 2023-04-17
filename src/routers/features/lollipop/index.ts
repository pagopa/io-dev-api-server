import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";
import * as B from "fp-ts/lib/boolean";
import { getProblemJson } from "../../../payloads/error";
import * as jose from "jose";
/**
 * this router serves lollipop API
 */
import { Request, Response, Router } from "express";

import { addHandler } from "../../../payloads/response";
import { getAssertionRef, getPublicKey } from "../../../persistence/lollipop";
import { verifySignatureHeader } from "@mattrglobal/http-signatures";
import { signAlgorithmToVerifierMap } from "../../../utils/httpSignature";
import { serverUrl } from "../../../utils/server";

export const lollipopRouter = Router();

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM = "sha256";

const brokenVerifier = (_: jose.JWK) => {
  throw new Error("broken verifier");
};

const toRequestOption = (req: Request, publicKey: jose.JWK) => {
  const headers = req.headers;
  return {
    verifier: {
      verify:
        req.body["message"] === "BROKEN"
          ? brokenVerifier(publicKey)
          : publicKey.kty === "EC"
          ? signAlgorithmToVerifierMap["ecdsa-p256-sha256"].verify(publicKey)
          : signAlgorithmToVerifierMap["rsa-pss-sha256"].verify(publicKey)
    },
    url: serverUrl,
    method: req.method,
    httpHeaders:
      req.body["message"] === "INVALID"
        ? { ...headers, "x-pagopa-lollipop-original-method": "xxx" }
        : headers,
    body: req.body,
    verifyExpiry: false
  };
};

const toTaskError = (
  res: Response,
  code: number,
  title?: string,
  detail?: string
) => T.of(res.status(code).send(getProblemJson(code, title, detail)));

addHandler(lollipopRouter, "post", "/first-lollipop/sign", async (req, res) =>
  pipe(
    getPublicKey(),
    O.fromNullable,
    O.foldW(
      () => toTaskError(res, 500, "Public key not found"),
      publicKey =>
        pipe(
          TE.tryCatch(
            () =>
              verifySignatureHeader(toRequestOption(req, publicKey)).unwrapOr({
                verified: false
              }),
            e => e as Error
          ),
          TE.foldW(
            e => toTaskError(res, 500, JSON.stringify(e)),
            verificationResult =>
              pipe(
                verificationResult.verified,
                B.fold(
                  () =>
                    toTaskError(
                      res,
                      400,
                      "Invalid signature",
                      JSON.stringify(verificationResult)
                    ),
                  () => T.of(res.send({ response: getAssertionRef() }))
                )
              )
          )
        )
    )
  )()
);
