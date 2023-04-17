import { getProblemJson } from "../../../payloads/error";
/**
 * this router serves lollipop API
 */
import { Router } from "express";

import { addHandler } from "../../../payloads/response";
import { getAssertionRef, getPublicKey } from "../../../persistence/lollipop";
import { verifySignatureHeader } from "@mattrglobal/http-signatures";
import { signAlgorithmToVerifierMap } from "../../../utils/httpSignature";
import { serverUrl } from "../../../utils/server";

export const lollipopRouter = Router();

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM = "sha256";

addHandler(lollipopRouter, "post", "/first-lollipop/sign", async (req, res) => {
  const headers = req.headers;
  const publicKey = getPublicKey();

  if (!publicKey) {
    return res.status(500).send(getProblemJson(500, "Public key not found"));
  }

  const requestOption = {
    verifier: {
      verify:
        publicKey.kty === "EC"
          ? signAlgorithmToVerifierMap["ecdsa-p256-sha256"].verify(publicKey)
          : signAlgorithmToVerifierMap["rsa-pss-sha256"].verify(publicKey)
    },
    url: serverUrl,
    method: req.method,
    httpHeaders:
      req.body["message"] === "INVALID"
        ? { ...headers, "x-pagopa-lollipop-original-method": "xxx" }
        : headers,
    body: req.body,
    verifyExpiry: false
  };

  try {
    const verificationResult = await verifySignatureHeader(requestOption);
    const verification = verificationResult.unwrapOr({
      verified: false
    }).verified;

    if (verification) {
      return res.send({ response: getAssertionRef() });
    } else {
      return res.status(400).send(getProblemJson(400, "Invalid signature"));
    }
  } catch (e) {
    return res.status(500).send(getProblemJson(500, JSON.stringify(e)));
  }
});
