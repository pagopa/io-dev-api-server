import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as crypto from "crypto";
import * as jose from "jose";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/lib/Task";

export const verifyCustomContentChallenge = (
  signatureBase: string | undefined,
  signatureToVerify: string,
  publicKey: jose.JWK
) =>
  pipe(
    toPem(publicKey),
    TE.fold(
      _ => T.of(false),
      pemKey =>
        T.of(
          crypto
            .createVerify("sha256")
            .update(signatureBase!)
            .verify(
              {
                key: pemKey,
                padding:
                  publicKey.kty == "RSA"
                    ? crypto.constants.RSA_PKCS1_PSS_PADDING
                    : undefined
              },
              signatureToVerify,
              "base64"
            )
        )
    )
  );

const toDigestAlgo = (jwk: jose.JWK) => (jwk.kty === "EC" ? "ES256" : "PS256");

// https://www.scottbrady91.com/jose/jwts-which-signing-algorithm-should-i-use
export const toPem = (jwk: jose.JWK) =>
  pipe(
    TE.tryCatch(
      () => jose.importJWK(jwk, toDigestAlgo(jwk)),
      e => new Error(String(e))
    ),
    TE.chain(publicKey =>
      TE.tryCatch(
        () => jose.exportSPKI(<jose.KeyLike>publicKey),
        e => new Error(String(e))
      )
    ),
    TE.map(result => result.trim())
  );

export const getCustomContentSignatureBase = (
  signatureInput: string,
  challengeHex: string,
  headerName: string
) =>
  pipe(
    signatureInput.split(","),
    A.findFirst(value =>
      new RegExp(`^sig\\d+=\\("${headerName}"\\)`).test(value)
    ),
    O.fold(
      () => undefined,
      sigInput => {
        return {
          signatureBase: `"${headerName}": ${challengeHex}\n"@signature-params": ${sigInput.replace(
            /^sig\d+=/,
            ""
          )}`,
          signatureLabel: sigInput.match(/^sig(\d+)/)?.[0]
        };
      }
    )
  );

export const getCustomContentChallenge = (
  signatureLabel: string,
  signature: string
) =>
  pipe(
    signature,
    s => new RegExp(`${signatureLabel}=:(.+?):`).exec(s),
    O.fromNullable,
    O.map(match => match[1]),
    O.fold(
      () => "",
      result => result 
    )
  );
