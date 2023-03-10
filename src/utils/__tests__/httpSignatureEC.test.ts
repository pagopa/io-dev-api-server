import {
  getCustomContentChallenge,
  getCustomContentSignatureBase,
  toPem,
  verifyCustomContentChallenge
} from "../httpSignature";
import * as TE from "fp-ts/TaskEither";
import * as jose from "jose";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import {
  VerifySignatureHeaderOptions,
  AlgorithmTypes,
  verifySignatureHeader
} from "@mattrglobal/http-signatures";

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

// signature_input header from the API request
const SIGNATURE_INPUT =
  'sig1=("content-digest" "content-type" "x-pagopa-lollipop-original-method" "x-pagopa-lollipop-original-url");created=1677499068;nonce="nonceMockedBase64";alg="ecdsa-p256-sha256";keyid="cZHpXWy9TJ4AlV7uPSra4o6ojTel5wQPvWhJOui7Wb4",sig2=("x-pagopa-lollipop-custom-tos-challange");created=1677499068;nonce="nonceMockedBase64";alg="ecdsa-p256-sha256";keyid="cZHpXWy9TJ4AlV7uPSra4o6ojTel5wQPvWhJOui7Wb4",sig3=("x-pagopa-lollipop-custom-sign-challenge");created=1677499068;nonce="nonceMockedBase64";alg="ecdsa-p256-sha256";keyid="cZHpXWy9TJ4AlV7uPSra4o6ojTel5wQPvWhJOui7Wb4"';
// signature header frome the API request
const SIGNATURE =
  "sig1=:MEYCIQDLDC1Iqg98aRhm0j8rWDdQHyrgeaDORsq1SeIzZgwywQIhAOYnl404A7A2dAlrZ5OrTEIZjHsqF6gm362UoYZWrHXY:,sig2=:MEQCIHUQzoJAEFUIcWs2mhYKgxzShLRZjICzEQpbUeqY67YKAiA+VYHV3k+gtKvzi5ofkojk0kSu4sP1QDyfx2aGJLBvtA==:,sig3=:MEQCIDFGUsH31mYJ0eLM9OFEdwjkKBK12IyqJ4CbJnM3aes5AiBdqasrQvjW21lgxxrlEpmOWRXLKN4vwXzWxOnXBbJaLA==:";
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

const TEST_CONTENT = [
  {
    header: "x-pagopa-lollipop-custom-tos-challange",
    signatureBase: TOS_CHALLENGE_SIGNATURE_BASE,
    challenge: TOS_CHALLENGE
  },
  {
    header: "x-pagopa-lollipop-custom-sign-challenge",
    signatureBase: CHALLENGE_SIGNATURE_BASE,
    challenge: CHALLENGE
  }
];

describe("Suite to test the http signature verification utility", () => {
  it("Test JWK thumbprint", async () => {
    const thumbprint = await jose.calculateJwkThumbprint(
      ecPublicKeyJwk,
      "sha256"
    );
    expect(thumbprint).toBe("cZHpXWy9TJ4AlV7uPSra4o6ojTel5wQPvWhJOui7Wb4");
  });

  it("Test JWK to PEM", async () => {
    const pemKey = await pipe(
      toPem(ecPublicKeyJwk),
      TE.fold(
        () => T.of(""),
        result => T.of(result)
      )
    )();
    expect(pemKey).toBe(ecPublicKeyPem);
  });

  TEST_CONTENT.forEach(content => {
    it(`Test FCI custom content to sign: ${JSON.stringify(
      content
    )}`, async () => {
      const customContentSignatureBase = getCustomContentSignatureBase(
        SIGNATURE_INPUT,
        content.challenge,
        content.header
      );
      expect(customContentSignatureBase!.signatureBase).toBe(
        content.signatureBase
      );
    });
  });

  TEST_CONTENT.forEach(content => {
    it(`Verify challenge signature: ${JSON.stringify(content)}`, async () => {
      const customContentSignatureBase = getCustomContentSignatureBase(
        SIGNATURE_INPUT,
        content.challenge,
        content.header
      );

      const customContentChallenge = getCustomContentChallenge(
        customContentSignatureBase!.signatureLabel!,
        SIGNATURE
      );

      const result = await verifyCustomContentChallenge(
        customContentSignatureBase!.signatureBase,
        customContentChallenge!,
        ecPublicKeyJwk
      )();

      expect(result).toBeTruthy();
    });
  });
});

const ecVerifier = async (
  _: { keyid: string; alg: AlgorithmTypes },
  data: Uint8Array,
  signature: Uint8Array
) => {
  return await verifyCustomContentChallenge(
    Buffer.from(data).toString("utf-8"),
    Buffer.from(signature).toString("base64"),
    ecPublicKeyJwk
  )();
};

const mockRequestOptions: VerifySignatureHeaderOptions = {
  verifier: {
    verify: ecVerifier
  },
  /**
   * Full url of the request including query parameters
   */
  url: "http://www.example.com",
  /**
   * The HTTP request method of the request
   */
  method: "GET",
  /**
   * Headers of the request
   * httpHeaders is filtered during verification to include only the ones form the signature.
   */
  httpHeaders: {
    "x-pagopa-lollipop-custom-tos-challange": TOS_CHALLENGE,
    signature: SIGNATURE,
    "signature-input": SIGNATURE_INPUT
  },
  /**
   * The body of the request
   */
  body: undefined,
  /**
   * Optional field to identify a single signature that should be verified from the signature header. If omitted, this function will attempt to verify all signatures present.
   */
  signatureKey: "sig2",
  /**
   * Optionally set this field to false if you don't want to fail verification based on the signature being past its expiry timestamp.
   * Defaults to true.
   */
  verifyExpiry: false
};

describe("Test http-signature", () => {
  it("Test custom signature: sig2", async () => {
    const verificationResult = await verifySignatureHeader(mockRequestOptions);
    expect(verificationResult).toBeTruthy();
  });
});
