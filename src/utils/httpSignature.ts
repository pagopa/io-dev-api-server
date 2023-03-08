import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as jose from "jose";

export const verifyCustomContentChallenge = (
  signatureBase: string,
  publicKey: jose.JWK
) => {};

const toDigestAlgo = (jwk: jose.JWK) => (jwk.kty === "EC" ? "ES256" : "PS256");

// https://www.scottbrady91.com/jose/jwts-which-signing-algorithm-should-i-use
export const toPem = async (jwk: jose.JWK) => {
  const publicKey = (await jose.importJWK(
    jwk,
    toDigestAlgo(jwk)
  )) as jose.KeyLike;
  // here we get the value trimmed because we remove prefix spaces
  // in our test variable
  return (await jose.exportSPKI(publicKey)).trim();
};

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
      sigInput =>
        `"${headerName}": ${challengeHex}\n"@signature-params": ${sigInput.replace(
          /^sig\d+=/,
          ""
        )}`
    )
  );

export function getCustomContentSignatureBaseImperative(
  signatureInput: string,
  challengeHex: string,
  headerName: string
) {
  const signatureInputArray = signatureInput.split(",");
  for (let index = 0; index < signatureInputArray.length; index++) {
    const signatureInput = signatureInputArray[index];
    const startWith = `sig${index + 1}=`;
    if (signatureInput.indexOf(`${startWith}("${headerName}")`) >= 0) {
      let signatureParams = signatureInput.replace(startWith, "");
      return `"${headerName}": ${challengeHex}\n"@signature-params": ${signatureParams}`;
    }
  }
}
