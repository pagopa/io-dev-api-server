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

// Android EC Public Key
const ecPublicKeyJwk = {
  x: "RwepAfMslwmtwEwgSUsLU74z6nRfhtC08xIcPuyvYwc=",
  crv: "P-256",
  y: "OzmswHrhmrLItOEcZ8rih4N3kWKRLCY0wsGSNZJcblU=",
  kty: "EC"
};

const ecPublicKeyPem = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAERwepAfMslwmtwEwgSUsLU74z6nRf
htC08xIcPuyvYwc7OazAeuGassi04RxnyuKHg3eRYpEsJjTCwZI1klxuVQ==
-----END PUBLIC KEY-----`;

const ecThumbprint = "bLYYuCTAYVd7hEgxjGBkoyn1u6ztoSPlJZ5Oof6r3D4";

// signature_input header from the API request
const SIGNATURE_INPUT =
  'sig1=("x-pagopa-lollipop-original-method" "x-pagopa-lollipop-original-url");created=1678475063;nonce="nonce-123";alg="ecdsa-p256-sha256";keyid="bLYYuCTAYVd7hEgxjGBkoyn1u6ztoSPlJZ5Oof6r3D4",sig2=("x-pagopa-lollipop-custom-tos-challenge");created=1678475063;nonce="nonce-123";alg="ecdsa-p256-sha256";keyid="bLYYuCTAYVd7hEgxjGBkoyn1u6ztoSPlJZ5Oof6r3D4",sig3=("x-pagopa-lollipop-custom-sign-challenge");created=1678475063;nonce="nonce-123";alg="ecdsa-p256-sha256";keyid="bLYYuCTAYVd7hEgxjGBkoyn1u6ztoSPlJZ5Oof6r3D4"';
// signature header frome the API request
const SIGNATURE =
  "sig1=:MEUCIEIiVuX/89DqpcDbgxfGt6K4qyXuUZrSWw2VXiSvisnUAiEAk45ItfrPjVtCRNT9UxAdRNlqQFEQp3r/kKRmtm18/G8=:,sig2=:MEQCICEHaC5BU/YykE29PwfcAmwTkChlLldnEaTD7EeOiNo1AiBw5Jwde1v7hBHTTq6dPCeW3UXiILXHwkL+wrvV6ZOnzw==:,sig3=:MEQCIEvP0eFuLO5Grg3a878gQ4AKXXPMM8pokIA5Ieliq2TBAiBkJBe0DX0Ovd/kbhv0Wi1es2R2HYfCUPzruxvxjyCg7Q==:";
// LC HEX encoded TOS hash to be verified
const TOS_CHALLENGE =
  "f46a0523e83e2c45b3b948e76bb6617d35e0159f9ae2ccf27865efb5d390f8aa";
// LC HEX encoded Documents hash to be verified
const CHALLENGE =
  "2a6a0a73efb1197847f2426d3b508411688ddc924248cde9aae0911aad73a676";

const TOS_CHALLENGE_SIGNATURE_BASE = `"x-pagopa-lollipop-custom-tos-challenge": f46a0523e83e2c45b3b948e76bb6617d35e0159f9ae2ccf27865efb5d390f8aa
"@signature-params": ("x-pagopa-lollipop-custom-tos-challenge");created=1678475063;nonce="nonce-123";alg="ecdsa-p256-sha256";keyid="bLYYuCTAYVd7hEgxjGBkoyn1u6ztoSPlJZ5Oof6r3D4"`;

const CHALLENGE_SIGNATURE_BASE = `"x-pagopa-lollipop-custom-sign-challenge": 2a6a0a73efb1197847f2426d3b508411688ddc924248cde9aae0911aad73a676
"@signature-params": ("x-pagopa-lollipop-custom-sign-challenge");created=1678475063;nonce="nonce-123";alg="ecdsa-p256-sha256";keyid="bLYYuCTAYVd7hEgxjGBkoyn1u6ztoSPlJZ5Oof6r3D4"`;

const TEST_CONTENT = [
  {
    header: "x-pagopa-lollipop-custom-tos-challenge",
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
    expect(thumbprint).toBe(ecThumbprint);
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
  console.log(Buffer.from(data).toString("utf-8"));
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
    host: "127.0.0.1:3000",
    connection: "Keep-Alive",
    "accept-encoding": "gzip",
    "user-agent": "okhttp/4.9.2",
    "x-pagopa-lollipop-original-url": "/api/v1/profile",
    "x-pagopa-lollipop-original-method": "GET",
    "x-pagopa-lollipop-custom-tos-challenge": TOS_CHALLENGE,
    "x-pagopa-lollipop-custom-sign-challenge": CHALLENGE,
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
  signatureKey: "sig3",
  /**
   * Optionally set this field to false if you don't want to fail verification based on the signature being past its expiry timestamp.
   * Defaults to true.
   */
  verifyExpiry: false
};

describe("Test http-signature", () => {
  it("Test custom signature: sig3", async () => {
    const verificationResult = await verifySignatureHeader(mockRequestOptions);
    const verification = verificationResult.unwrapOr({
      verified: false
    }).verified;
    console.log(
      "✅ " +
        JSON.stringify(verificationResult) +
        ", " +
        verificationResult.andThen
    );
    expect(verificationResult.isOk()).toBeTruthy();
    expect(verification).toBeTruthy();
  });
});
