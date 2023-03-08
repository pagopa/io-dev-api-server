import {
  getCustomContentSignatureBase,
  getCustomContentSignatureBaseImperative,
  toPem
} from "../httpSignature";
import * as crypto from "crypto";
import * as jose from "jose";

const rsaPublicKeyJwk = {
  e: "AQAB",
  n:
    "AKziIQ5w1ikOIPFWEczl7qsZDQ8mEdhqdebUo3dQxX53HIdXpMzLcMEvnqsBqISOPlGhdCUSOpUAaYQQTSEsi3SeVX9W9YQXHjua/QXQfDCZjrS/QOlQ5sf7LxA7JqIwp9J0dpMArQeZ1/3+YiIF+hlDZvqcKYzdTUbAX/05D/ifyVu8vynAYDEEPSmYobaH2vdDV/vJlKoeEP+41U51iVjuo+1bp1xnXR4N3CapPtaR/r5zzB/KWF+ZfHhE8V68NiqIoiS87TJnMso887HcCruqdPQpu77kRSYN9n+Au2tKUEKQgzBZGDDVVqTFJpZ5NQDRkakV7v+m6sbYxIYfKus=",
  alg: "RS256",
  kty: "RSA"
};

const rsaPublicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArOIhDnDWKQ4g8VYRzOXu
qxkNDyYR2Gp15tSjd1DFfncch1ekzMtwwS+eqwGohI4+UaF0JRI6lQBphBBNISyL
dJ5Vf1b1hBceO5r9BdB8MJmOtL9A6VDmx/svEDsmojCn0nR2kwCtB5nX/f5iIgX6
GUNm+pwpjN1NRsBf/TkP+J/JW7y/KcBgMQQ9KZihtofa90NX+8mUqh4Q/7jVTnWJ
WO6j7VunXGddHg3cJqk+1pH+vnPMH8pYX5l8eETxXrw2KoiiJLztMmcyyjzzsdwK
u6p09Cm7vuRFJg32f4C7a0pQQpCDMFkYMNVWpMUmlnk1ANGRqRXu/6bqxtjEhh8q
6wIDAQAB
-----END PUBLIC KEY-----`;

describe("suite to test the http signature verification utility", () => {
  // signature_input header from the API request
  const SIGNATURE_INPUT =
    'sig1=("x-pagopa-lollipop-original-method" "x-pagopa-lollipop-original-url");created=1678294979;nonce="nonce-123";alg="rsa-pss-sha256";keyid="eEnBCuyqeXY8y96UgWKLgoFMtS7JFrjYJY_oiHPmzw4",sig2=("x-pagopa-lollipop-custom-tos");created=1678294979;nonce="nonce-123";alg="rsa-pss-sha256";keyid="eEnBCuyqeXY8y96UgWKLgoFMtS7JFrjYJY_oiHPmzw4",sig3=("x-pagopa-lollipop-custom-sign");created=1678294979;nonce="nonce-123";alg="rsa-pss-sha256";keyid="eEnBCuyqeXY8y96UgWKLgoFMtS7JFrjYJY_oiHPmzw4"';
  // LC HEX encoded TOS hash to be verified
  const TOS_CHALLENGE = "ASDFFA324SDFA==";

  // LC HEX encoded Documents hash to be verified
  const CHALLENGE = "DAFDEFAF323DSFA==";

  const TOS_CHALLENGE_SIGNATURE_BASE = `"x-pagopa-lollipop-custom-tos": ASDFFA324SDFA==
"@signature-params": ("x-pagopa-lollipop-custom-tos");created=1678294979;nonce="nonce-123";alg="rsa-pss-sha256";keyid="eEnBCuyqeXY8y96UgWKLgoFMtS7JFrjYJY_oiHPmzw4"`;

  const CHALLENGE_SIGNATURE_BASE = `"x-pagopa-lollipop-custom-sign": DAFDEFAF323DSFA==
"@signature-params": ("x-pagopa-lollipop-custom-sign");created=1678294979;nonce="nonce-123";alg="rsa-pss-sha256";keyid="eEnBCuyqeXY8y96UgWKLgoFMtS7JFrjYJY_oiHPmzw4"`;

  const TOS_CHALLENGE_SIGNATURE =
    "mqxQLiN8iKiRPpQmR6az6pFyOjByTkyF5joBjo0FW+HCzKcK5o14BMCoa40lRYmujIkdISwtgY5Y+nON3yCTk4o+z4tCCujeUdi2gTmnV2hbxMobdk8cS3xD4wVsWYh8AZAog9Oq6zpOgEYSEGwELkLraxtZOpLrLiPWNeqZrLXJ83vFiufz79Mva4xF+UV9dNReTml6bBI1yX6L7Kg8PNNJ9Le8/tacrsTxbq7vg+rzSqaVnqM54Y++Z+/OhoCLDACDYCsXhW6xKloSrwbyfzmNvn3M3rIu8BbmznTlAuPtPoCmAUVOIE2ZxT+4iMDc9vZqY6t89wQSoYATom5FFA==";
  const CHALLENGE_SIGNATURE =
    "NbKJPJSiZ4XJilXYHFP2dL1CFCfU2Yl5xWQHPBczVwsDDlB6R8mGo0O3z85aqBY0NEKzCES/df91Q0LvBP9lx37XD3rHU2hBDkesF4uIS9cpB9EGYkkrrW6KpH3UyvyZnIcWnICLqV7dyDr8rwPBvF+Nf4ZBfRgZLn+35f4PP8BgT0Jxz6OJD9KeVFsCXlHZ3qwzTfOMnwyn5yu2ugpxbzSNLMsiaW9T1Lqram2y9mzuyKXWHo53Fl+Giftqhj7CdNt89OyLL8c6+t5mnchpFCj9h3H6E6IhPBckvZVw3Nw93T4eUUrchhNrv8vV2uMt56f04fFsOfWZNQDf8PgVvw==";

  it("test JWK thumbprint", async () => {
    const thumbprint = await jose.calculateJwkThumbprint(
      rsaPublicKeyJwk,
      "sha256"
    );
    expect(thumbprint).toBe("eEnBCuyqeXY8y96UgWKLgoFMtS7JFrjYJY_oiHPmzw4");
  });

  it("test JWK to PEM", async () => {
    const pemKey = await toPem(rsaPublicKeyJwk);
    expect(pemKey).toBe(rsaPublicKeyPem);
  });

  it("test FCI custom content to sign (fp-ts)", async () => {
    const tosChallengeSignatureBase = getCustomContentSignatureBase(
      SIGNATURE_INPUT,
      TOS_CHALLENGE,
      "x-pagopa-lollipop-custom-tos"
    );

    const challengeSignatureBase = getCustomContentSignatureBase(
      SIGNATURE_INPUT,
      CHALLENGE,
      "x-pagopa-lollipop-custom-sign"
    );

    expect(tosChallengeSignatureBase).toBe(TOS_CHALLENGE_SIGNATURE_BASE);
    expect(challengeSignatureBase).toBe(CHALLENGE_SIGNATURE_BASE);
  });

  it("test FCI custom content to sign (imperative)", async () => {
    const tosChallengeSignatureBase = getCustomContentSignatureBaseImperative(
      SIGNATURE_INPUT,
      TOS_CHALLENGE,
      "x-pagopa-lollipop-custom-tos"
    );

    const challengeSignatureBase = getCustomContentSignatureBaseImperative(
      SIGNATURE_INPUT,
      CHALLENGE,
      "x-pagopa-lollipop-custom-sign"
    );

    expect(tosChallengeSignatureBase).toBe(TOS_CHALLENGE_SIGNATURE_BASE);
    expect(challengeSignatureBase).toBe(CHALLENGE_SIGNATURE_BASE);
  });

  it("Verify tos challenge signature", async () => {
    const tosChallengeSignatureBase = getCustomContentSignatureBase(
      SIGNATURE_INPUT,
      TOS_CHALLENGE,
      "x-pagopa-lollipop-custom-tos"
    );

    const pemPublicKey = await toPem(rsaPublicKeyJwk);
    console.log(crypto.getHashes());
    const verifier = crypto.createVerify("rsa-sha256");
    verifier.update(tosChallengeSignatureBase!);
    const verificationResult = verifier.verify(
      {
        key: pemPublicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING
      },
      TOS_CHALLENGE_SIGNATURE,
      "base64"
    );
    expect(verificationResult).toBeTruthy();
  });

  it("Verify challenge signature", async () => {
    const challengeSignatureBase = getCustomContentSignatureBase(
      SIGNATURE_INPUT,
      CHALLENGE,
      "x-pagopa-lollipop-custom-sign"
    );

    const pemPublicKey = await toPem(rsaPublicKeyJwk);
    const verifier = crypto.createVerify("sha256");
    verifier.update(challengeSignatureBase!);
    const verificationResult = verifier.verify(
      {
        key: pemPublicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING
      },
      CHALLENGE_SIGNATURE,
      "base64"
    );
    expect(verificationResult).toBeTruthy();
  });
});
