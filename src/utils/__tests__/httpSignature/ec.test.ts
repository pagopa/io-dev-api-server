import {
  getCustomContentChallenge,
  getCustomContentSignatureBase,
  toPem,
  verifyCustomContentChallenge
} from "../../httpSignature";
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

const TOS_HEADER_NAME = "x-pagopa-lollipop-custom-tos-challenge";
const SIGNATURE_HEADER_NAME = "x-pagopa-lollipop-custom-sign-challenge";

const TOS_CHALLENGE_SIGNATURE_BASE = `"${TOS_HEADER_NAME}": f46a0523e83e2c45b3b948e76bb6617d35e0159f9ae2ccf27865efb5d390f8aa
"@signature-params": ("${TOS_HEADER_NAME}");created=1678475063;nonce="nonce-123";alg="ecdsa-p256-sha256";keyid="bLYYuCTAYVd7hEgxjGBkoyn1u6ztoSPlJZ5Oof6r3D4"`;

const CHALLENGE_SIGNATURE_BASE = `"${SIGNATURE_HEADER_NAME}": 2a6a0a73efb1197847f2426d3b508411688ddc924248cde9aae0911aad73a676
"@signature-params": ("${SIGNATURE_HEADER_NAME}");created=1678475063;nonce="nonce-123";alg="ecdsa-p256-sha256";keyid="bLYYuCTAYVd7hEgxjGBkoyn1u6ztoSPlJZ5Oof6r3D4"`;

const TEST_CONTENT = [
  {
    header: TOS_HEADER_NAME,
    signatureBase: TOS_CHALLENGE_SIGNATURE_BASE,
    challenge: TOS_CHALLENGE
  },
  {
    header: SIGNATURE_HEADER_NAME,
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
  return await verifyCustomContentChallenge(
    Buffer.from(data).toString("utf-8"),
    Buffer.from(signature).toString("base64"),
    ecPublicKeyJwk
  )();
};

describe("Test http-signature", () => {
  ["sig1", "sig2", "sig3", undefined].forEach(sigLabel => {
    const mockRequestOptions: VerifySignatureHeaderOptions = {
      verifier: {
        verify: ecVerifier
      },
      url: "http://127.0.0.1:3000",
      method: "GET",
      httpHeaders: {
        host: "127.0.0.1:3000",
        connection: "Keep-Alive",
        "accept-encoding": "gzip",
        "user-agent": "okhttp/4.9.2",
        "x-pagopa-lollipop-original-url": "/api/v1/profile",
        "x-pagopa-lollipop-original-method": "GET",
        [TOS_HEADER_NAME]: TOS_CHALLENGE,
        [SIGNATURE_HEADER_NAME]: CHALLENGE,
        signature: SIGNATURE,
        "signature-input": SIGNATURE_INPUT
      },
      body: undefined,
      signatureKey: sigLabel,
      verifyExpiry: false
    };
    it(`Test custom signature: ${sigLabel}`, async () => {
      const verificationResult = await verifySignatureHeader(
        mockRequestOptions
      );
      const verification = verificationResult.unwrapOr({
        verified: false
      }).verified;
      expect(verificationResult.isOk()).toBeTruthy();
      expect(verification).toBeTruthy();
    });
  });
});
