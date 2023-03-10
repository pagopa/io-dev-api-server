import {
  getCustomContentChallenge,
  getCustomContentSignatureBase,
  toPem,
  verifyCustomContentChallenge
} from "../httpSignature";
import * as jose from "jose";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";

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
  // signature header frome the API request
  const SIGNATURE =
    "sig1:foo:,sig2:mqxQLiN8iKiRPpQmR6az6pFyOjByTkyF5joBjo0FW+HCzKcK5o14BMCoa40lRYmujIkdISwtgY5Y+nON3yCTk4o+z4tCCujeUdi2gTmnV2hbxMobdk8cS3xD4wVsWYh8AZAog9Oq6zpOgEYSEGwELkLraxtZOpLrLiPWNeqZrLXJ83vFiufz79Mva4xF+UV9dNReTml6bBI1yX6L7Kg8PNNJ9Le8/tacrsTxbq7vg+rzSqaVnqM54Y++Z+/OhoCLDACDYCsXhW6xKloSrwbyfzmNvn3M3rIu8BbmznTlAuPtPoCmAUVOIE2ZxT+4iMDc9vZqY6t89wQSoYATom5FFA==:,sig3:NbKJPJSiZ4XJilXYHFP2dL1CFCfU2Yl5xWQHPBczVwsDDlB6R8mGo0O3z85aqBY0NEKzCES/df91Q0LvBP9lx37XD3rHU2hBDkesF4uIS9cpB9EGYkkrrW6KpH3UyvyZnIcWnICLqV7dyDr8rwPBvF+Nf4ZBfRgZLn+35f4PP8BgT0Jxz6OJD9KeVFsCXlHZ3qwzTfOMnwyn5yu2ugpxbzSNLMsiaW9T1Lqram2y9mzuyKXWHo53Fl+Giftqhj7CdNt89OyLL8c6+t5mnchpFCj9h3H6E6IhPBckvZVw3Nw93T4eUUrchhNrv8vV2uMt56f04fFsOfWZNQDf8PgVvw==:";
  // LC HEX encoded TOS hash to be verified
  const TOS_CHALLENGE = "ASDFFA324SDFA==";

  // LC HEX encoded Documents hash to be verified
  const CHALLENGE = "DAFDEFAF323DSFA==";

  const TOS_CHALLENGE_SIGNATURE_BASE = `"x-pagopa-lollipop-custom-tos": ASDFFA324SDFA==
"@signature-params": ("x-pagopa-lollipop-custom-tos");created=1678294979;nonce="nonce-123";alg="rsa-pss-sha256";keyid="eEnBCuyqeXY8y96UgWKLgoFMtS7JFrjYJY_oiHPmzw4"`;

  const CHALLENGE_SIGNATURE_BASE = `"x-pagopa-lollipop-custom-sign": DAFDEFAF323DSFA==
"@signature-params": ("x-pagopa-lollipop-custom-sign");created=1678294979;nonce="nonce-123";alg="rsa-pss-sha256";keyid="eEnBCuyqeXY8y96UgWKLgoFMtS7JFrjYJY_oiHPmzw4"`;

  const TEST_CONTENT = [
    {
      header: "x-pagopa-lollipop-custom-tos",
      signatureBase: TOS_CHALLENGE_SIGNATURE_BASE,
      challenge: TOS_CHALLENGE
    },
    {
      header: "x-pagopa-lollipop-custom-sign",
      signatureBase: CHALLENGE_SIGNATURE_BASE,
      challenge: CHALLENGE
    }
  ];

  it("test JWK thumbprint", async () => {
    const thumbprint = await jose.calculateJwkThumbprint(
      rsaPublicKeyJwk,
      "sha256"
    );
    expect(thumbprint).toBe("eEnBCuyqeXY8y96UgWKLgoFMtS7JFrjYJY_oiHPmzw4");
  });

  it("test JWK to PEM", async () => {
    pipe(
      toPem(rsaPublicKeyJwk),
      TE.getOrElse(() => T.of("")),
      T.map(pemKey => expect(pemKey).toBe(rsaPublicKeyPem))
    );
  });

  it("test FCI custom content to sign", async () => {
    TEST_CONTENT.forEach(content => {
      pipe(
        getCustomContentSignatureBase(
          SIGNATURE_INPUT,
          content.challenge,
          content.header
        ),
        customContentSignatureBase =>
          expect(customContentSignatureBase!.signatureBase).toBe(
            content.signatureBase
          )
      );
    });
  });

  it("Verify tos challenge signature", async () => {
    TEST_CONTENT.forEach(content => {
      pipe(
        getCustomContentSignatureBase(
          SIGNATURE_INPUT,
          content.challenge,
          content.header
        ),
        signatureBase =>
          pipe(
            getCustomContentChallenge(
              signatureBase!.signatureLabel!,
              SIGNATURE
            ),
            signatureChallenge =>
              pipe(
                verifyCustomContentChallenge(
                  signatureBase!.signatureBase,
                  signatureChallenge!,
                  rsaPublicKeyJwk
                ),
                verificationResult => expect(verificationResult).toBeTruthy()
              )
          )
      );
    });
  });
});
