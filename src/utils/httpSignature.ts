import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as crypto from "crypto";
import * as jose from "jose";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/lib/Task";

export const verifyCustomContentChallenge = async (
  signatureBase: string | undefined,
  signatureToVerify: string,
  publicKey: jose.JWK
): Promise<boolean> => {
  if (!signatureBase) {
    return false;
  }
  const pemPublicKey = await toPem(publicKey)();
  const verifier = crypto.createVerify("sha256");
  verifier.update(signatureBase!);
  const keyObject: crypto.VerifyPublicKeyInput = {
    key: pemPublicKey
  };
  if (publicKey.kty == "RSA") {
    keyObject["padding"] = crypto.constants.RSA_PKCS1_PSS_PADDING;
  }
  return verifier.verify(keyObject, signatureToVerify, "base64");
};

const toDigestAlgo = (jwk: jose.JWK) => (jwk.kty === "EC" ? "ES256" : "PS256");

// https://www.scottbrady91.com/jose/jwts-which-signing-algorithm-should-i-use
export const toPemImperative = async (jwk: jose.JWK) => {
  const publicKey = (await jose.importJWK(
    jwk,
    toDigestAlgo(jwk)
  )) as jose.KeyLike;
  // here we get the value trimmed because we remove prefix spaces
  // in our test variable
  return (await jose.exportSPKI(publicKey)).trim();
};

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
    TE.map(result => result.trim()),
    // TODO: rimuovere per avere TaskEither quando anche il restò sarà in fp-ts
    TE.getOrElse(() => T.of(""))
  );

export const getCustomContentSignatureBase = (
  signatureInput: string,
  challengeHex: string,
  headerName: string
) =>
  pipe(
    signatureInput.split(","),
    A.findFirst(value => {
      return new RegExp(`^sig\\d+=\\("${headerName}"\\)`).test(value);
    }),
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

export function getCustomContentSignatureBaseImperative(
  signatureInput: string,
  challengeHex: string,
  headerName: string
) {
  const signatureInputArray = signatureInput.split(",");
  for (let index = 1; index < signatureInputArray.length; index++) {
    const signatureInput = signatureInputArray[index];
    const startWith = `sig${index + 1}=`;
    if (signatureInput.indexOf(`${startWith}("${headerName}")`) >= 0) {
      let signatureParams = signatureInput.replace(startWith, "");
      const signatureBase = `"${headerName}": ${challengeHex}\n"@signature-params": ${signatureParams}`;
      const signatureLabel = startWith.slice(0, -1);
      return {
        signatureBase,
        signatureLabel
      };
    }
  }
  return {};
}

export function getCustomContentChallengeImperative(
  signatureLabel: string,
  signature: string
) {
  const startWith = `${signatureLabel}:`;
  const regex = new RegExp(`${startWith}(.+?):`);
  const match = signature.match(regex);
  return match?.length ? match[1] : undefined;
}

export const getCustomContentChallenge = (
  signatureLabel: string,
  signature: string
) =>
  pipe(
    signature,
    s => new RegExp(`${signatureLabel}:(.+?):`).exec(s),
    O.fromNullable,
    O.map(match => match[1]),
    O.toUndefined
  );
