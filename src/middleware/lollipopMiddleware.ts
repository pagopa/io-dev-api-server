import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";
import * as B from "fp-ts/lib/boolean";
import * as E from "fp-ts/lib/Either";
import * as jose from "jose";
import { Request, Response } from "express-serve-static-core";
import { verifySignatureHeader } from "@mattrglobal/http-signatures";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { getPublicKey } from "../persistence/lollipop";
import { ioDevServerConfig } from "../config";
import { signAlgorithmToVerifierMap } from "../utils/httpSignature";
import { serverUrl } from "../utils/server";
import { getProblemJson } from "../payloads/error";

type LollipopHTTPStatusError = {
  code: number;
  problemJson: string;
};

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM = "sha256";

export const isLollipopConfigEnabled = () =>
  ioDevServerConfig.features.lollipop.enabled;

export const lollipopMiddleware =
  (nextMiddleware: (embeddedRequest: Request, _: Response) => void) =>
  (request: Request, response: Response) => {
    pipe(
      isLollipopConfigEnabled(),
      B.fold(
        () => nextMiddleware(request, response),
        () =>
          pipe(
            TE.tryCatch(
              () => verifyLollipopSignatureHeader(request, response),
              _ => _ as Error
            ),
            TE.map(verificationResult =>
              pipe(
                verificationResult,
                E.foldW(
                  error => response.status(error.code).send(error.problemJson),
                  _ => nextMiddleware(request, response)
                )
              )
            )
          )()
      )
    );
  };

const verifyLollipopSignatureHeader = (req: Request, _: Response) =>
  pipe(
    req.headers["signature-input"],
    NonEmptyString.decode,
    E.foldW(
      _ => T.of(toFailureEither(400, "signature-input header is empty")),
      () =>
        pipe(
          getPublicKey(),
          O.fromNullable,
          O.foldW(
            () => T.of(toFailureEither(500, "Public key not found")),
            publicKey =>
              pipe(
                TE.tryCatch(
                  () =>
                    verifySignatureHeader(
                      toVerifySignatureHeaderOptions(req, publicKey)
                    ).unwrapOr({ verified: false }),
                  e => e as Error
                ),
                TE.foldW(
                  e =>
                    T.of(
                      toFailureEither(500, e.message, JSON.stringify(e.stack))
                    ),
                  verificationResult =>
                    pipe(
                      verificationResult.verified,
                      B.fold(
                        () =>
                          T.of(
                            toFailureEither(
                              400,
                              "Invalid signature",
                              JSON.stringify(verificationResult)
                            )
                          ),
                        () => T.of(toSuccessEither())
                      )
                    )
                )
              )
          )
        )
    )
  )();

const toVerifySignatureHeaderOptions = (req: Request, publicKey: jose.JWK) => {
  const headers = req.headers;
  return {
    verifier: {
      verify:
        req.body.message === "BROKEN"
          ? brokenVerifier(publicKey)
          : publicKey.kty === "EC"
          ? signAlgorithmToVerifierMap["ecdsa-p256-sha256"].verify(publicKey)
          : signAlgorithmToVerifierMap["rsa-pss-sha256"].verify(publicKey)
    },
    url: serverUrl,
    method: req.method,
    httpHeaders:
      req.body.message === "INVALID"
        ? { ...headers, "x-pagopa-lollipop-original-method": "xxx" }
        : headers,
    body: req.body,
    verifyExpiry: false
  };
};

const brokenVerifier = (_: jose.JWK) => {
  throw new Error("broken verifier");
};

const toSuccessEither = (): E.Either<LollipopHTTPStatusError, true> =>
  E.right(true);

const toFailureEither = (
  code: number,
  title?: string,
  detail?: string
): E.Either<LollipopHTTPStatusError, true> =>
  E.left({
    code,
    problemJson: getProblemJson(code, title, detail)
  } as LollipopHTTPStatusError);
