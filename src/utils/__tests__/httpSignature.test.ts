import {
  getCustomContentSignatureBase,
  getCustomContentSignatureBaseImperative,
  toPem
} from "../httpSignature";
import * as crypto from "crypto";

const ecPublicKeyJwk = {
  crv: "P-256",
  kty: "EC",
  x: "/ric17QiSpZ9YCuitPxunbcHiCOjlicw76XOiBEpjpA=",
  y: "5Ckmg/mOuanYif6/MQq7eScIxcFNf55N/T1GMj4Xmp0="
};

const ecPublicKeyPem = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE/ric17QiSpZ9YCuitPxunbcHiCOj
licw76XOiBEpjpDkKSaD+Y65qdiJ/r8xCrt5JwjFwU1/nk39PUYyPheanQ==
-----END PUBLIC KEY-----`;

describe("suite to test the http signature verification utility", () => {
  // signature_input header from the API request
  const SIGNATURE_INPUT =
    'sig1=("content-digest" "content-type" "x-pagopa-lollipop-original-method" "x-pagopa-lollipop-original-url");created=1677499068;nonce="nonceMockedBase64";alg="ecdsa-p256-sha256";keyid="cZHpXWy9TJ4AlV7uPSra4o6ojTel5wQPvWhJOui7Wb4",sig2=("x-pagopa-lollipop-custom-tos-challange");created=1677499068;nonce="nonceMockedBase64";alg="ecdsa-p256-sha256";keyid="cZHpXWy9TJ4AlV7uPSra4o6ojTel5wQPvWhJOui7Wb4",sig3=("x-pagopa-lollipop-custom-sign-challenge");created=1677499068;nonce="nonceMockedBase64";alg="ecdsa-p256-sha256";keyid="cZHpXWy9TJ4AlV7uPSra4o6ojTel5wQPvWhJOui7Wb4"';
  // LC HEX encoded TOS hash to be verified
  const TOS_CHALLENGE =
    "f46a0523e83e2c45b3b948e76bb6617d35e0159f9ae2ccf27865efb5d390f8aa";

  // LC HEX encoded Documents hash to be verified
  const CHALLENGE =
    "2a6a0a73efb1197847f2426d3b508411688ddc924248cde9aae0911aad73a676";

  const TOS_CHALLENGE_SIGNATURE_BASE = `"x-pagopa-lollipop-custom-tos-challange": f46a0523e83e2c45b3b948e76bb6617d35e0159f9ae2ccf27865efb5d390f8aa
"@signature-params": ("x-pagopa-lollipop-custom-tos-challange");created=1677499068;nonce="nonceMockedBase64";alg="ecdsa-p256-sha256";keyid="cZHpXWy9TJ4AlV7uPSra4o6ojTel5wQPvWhJOui7Wb4"`;

  const CHALLENGE_SIGNATURE_BASE = `"x-pagopa-lollipop-custom-sign-challenge": 2a6a0a73efb1197847f2426d3b508411688ddc924248cde9aae0911aad73a676
"@signature-params": ("x-pagopa-lollipop-custom-sign-challenge");created=1677499068;nonce="nonceMockedBase64";alg="ecdsa-p256-sha256";keyid="cZHpXWy9TJ4AlV7uPSra4o6ojTel5wQPvWhJOui7Wb4"`;

  const TOS_CHALLENGE_SIGNATURE =
    "MEQCIHUQzoJAEFUIcWs2mhYKgxzShLRZjICzEQpbUeqY67YKAiA+VYHV3k+gtKvzi5ofkojk0kSu4sP1QDyfx2aGJLBvtA==";
  const CHALLENGE_SIGNATURE =
    "MEQCIDFGUsH31mYJ0eLM9OFEdwjkKBK12IyqJ4CbJnM3aes5AiBdqasrQvjW21lgxxrlEpmOWRXLKN4vwXzWxOnXBbJaLA==";

  it("test JWK to PEM", async () => {
    const pemKey = await toPem(ecPublicKeyJwk);
    expect(pemKey).toBe(ecPublicKeyPem);
  });

  it("test FCI custom content to sign (fp-ts)", async () => {
    const tosChallengeSignatureBase = getCustomContentSignatureBase(
      SIGNATURE_INPUT,
      TOS_CHALLENGE,
      "x-pagopa-lollipop-custom-tos-challange"
    );

    const challengeSignatureBase = getCustomContentSignatureBase(
      SIGNATURE_INPUT,
      CHALLENGE,
      "x-pagopa-lollipop-custom-sign-challenge"
    );

    expect(tosChallengeSignatureBase).toBe(TOS_CHALLENGE_SIGNATURE_BASE);
    expect(challengeSignatureBase).toBe(CHALLENGE_SIGNATURE_BASE);
  });

  it("test FCI custom content to sign (imperative)", async () => {
    const tosChallengeSignatureBase = getCustomContentSignatureBaseImperative(
      SIGNATURE_INPUT,
      TOS_CHALLENGE,
      "x-pagopa-lollipop-custom-tos-challange"
    );

    const challengeSignatureBase = getCustomContentSignatureBaseImperative(
      SIGNATURE_INPUT,
      CHALLENGE,
      "x-pagopa-lollipop-custom-sign-challenge"
    );

    expect(tosChallengeSignatureBase).toBe(TOS_CHALLENGE_SIGNATURE_BASE);
    expect(challengeSignatureBase).toBe(CHALLENGE_SIGNATURE_BASE);
  });

  it("Verify tos challenge signature", async () => {
    const signatureData = new Uint8Array(
      Buffer.from(TOS_CHALLENGE_SIGNATURE, "base64")
    );

    const tosChallengeSignatureBase = getCustomContentSignatureBase(
      SIGNATURE_INPUT,
      TOS_CHALLENGE,
      "x-pagopa-lollipop-custom-tos-challange"
    );

    const pemPublicKey = await toPem(ecPublicKeyJwk);
    const verifier = crypto.createVerify("sha256");
    verifier.update(tosChallengeSignatureBase!);
    const verificationResult = verifier.verify(pemPublicKey, signatureData);
    expect(verificationResult).toBeTruthy();
  });

  it("Verify challenge signature", async () => {
    const signatureData = new Uint8Array(
      Buffer.from(CHALLENGE_SIGNATURE, "base64")
    );

    const challengeSignatureBase = getCustomContentSignatureBase(
      SIGNATURE_INPUT,
      CHALLENGE,
      "x-pagopa-lollipop-custom-sign-challenge"
    );

    const pemPublicKey = await toPem(ecPublicKeyJwk);
    const verifier = crypto.createVerify("sha256");
    verifier.update(challengeSignatureBase!);
    const verificationResult = verifier.verify(pemPublicKey, signatureData);
    expect(verificationResult).toBeTruthy();
  });
});
