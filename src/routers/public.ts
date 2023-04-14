import { getProblemJson } from "./../payloads/error";
/**
 * this router serves all public API (those ones don't need session)
 */
import { UserAgentSemver } from "@pagopa/ts-commons/lib/http-user-agent";
import { JwkPublicKey, parseJwkOrError } from "@pagopa/ts-commons/lib/jwk";
import chalk from "chalk";
import { Response, Router } from "express";
import * as E from "fp-ts/lib/Either";
import * as jose from "jose";
import { parseStringPromise } from "xml2js";
import * as zlib from "zlib";
import { assetsFolder, ioDevServerConfig } from "../config";
import { backendInfo } from "../payloads/backend";
import {
  errorRedirectUrl,
  loginLolliPopRedirect,
  loginSessionToken,
  loginWithToken
} from "../payloads/login";
import { addHandler } from "../payloads/response";
import { readFileAsJSON, sendFile } from "../utils/file";
import { getSamlRequest } from "../utils/login";
import { resetBpd } from "./features/bdp";
import { resetBonusVacanze } from "./features/bonus-vacanze";
import { resetCgn } from "./features/cgn";
import { resetProfile } from "./profile";
import { resetWalletV2 } from "./walletsV2";
import {
  getAssertionRef,
  getPublicKey,
  setAssertionRef,
  setPublicKey
} from "../persistence/lollipop";
import { verifySignatureHeader } from "@mattrglobal/http-signatures";
import { signAlgorithmToVerifierMap } from "../utils/httpSignature";
import { serverUrl } from "../utils/server";

export const publicRouter = Router();

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM = "sha256";
const DEFAULT_HEADER_LOLLIPOP_PUB_KEY = "x-pagopa-lollipop-pub-key";

addHandler(publicRouter, "get", "/login", async (req, res) => {
  const lollipopPublicKeyHeaderValue = req.get(DEFAULT_HEADER_LOLLIPOP_PUB_KEY);
  const lollipopHashAlgorithmHeaderValue = req.get(
    "x-pagopa-lollipop-pub-key-hash-algo"
  );
  if (!lollipopPublicKeyHeaderValue || !lollipopHashAlgorithmHeaderValue) {
    const samlRequest = getSamlRequest();
    handleLollipopLoginRedirect(res, samlRequest);
    return;
  }

  const jwkPK = parseJwkOrError(lollipopPublicKeyHeaderValue);

  if (E.isLeft(jwkPK) || !JwkPublicKey.is(jwkPK.right)) {
    res.sendStatus(400);
    return;
  }

  const thumbprint = await jose.calculateJwkThumbprint(
    jwkPK.right,
    DEFAULT_LOLLIPOP_HASH_ALGORITHM
  );

  setAssertionRef(thumbprint);
  setPublicKey(jwkPK.right);

  const samlRequest = getSamlRequest(
    DEFAULT_LOLLIPOP_HASH_ALGORITHM,
    thumbprint
  );
  handleLollipopLoginRedirect(res, samlRequest, thumbprint);
});

addHandler(publicRouter, "post", "/first-lollipop/sign", async (req, res) => {
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

addHandler(publicRouter, "get", "/idp-login", (req, res) => {
  if (req.query.authorized === "1" || ioDevServerConfig.global.autoLogin) {
    res.redirect(loginWithToken);
    return;
  }
  if (req.query.error) {
    res.redirect(`${errorRedirectUrl}${req.query.error}`);
    return;
  }
  sendFile("assets/html/login.html", res);
});

addHandler(publicRouter, "get", "/assets/imgs/how_to_login.png", (_, res) => {
  sendFile("assets/imgs/how_to_login.png", res);
});

addHandler(publicRouter, "post", "/logout", (_, res) => {
  res.status(200).send({ message: "ok" });
});

addHandler(publicRouter, "get", "/info", (_, res) => res.json(backendInfo));

// ping (no longer needed since actually app disables network status checking)
addHandler(publicRouter, "get", "/ping", (_, res) => res.send("ok"));

// test login
addHandler(publicRouter, "post", "/test-login", (_, res) =>
  res.json({ token: loginSessionToken })
);

addHandler(publicRouter, "get", "/paywebview", (_, res) => {
  sendFile("assets/imgs/how_to_login.png", res);
});

// it should be useful to reset some states
addHandler(publicRouter, "get", "/reset", (_, res) => {
  type emptyFunc = () => void;
  const resets: ReadonlyArray<readonly [emptyFunc, string]> = [
    [resetProfile, "bonus vacanze"],
    [resetBonusVacanze, "user delete/download"],
    [resetBpd, "bdp"],
    [resetCgn, "cgn"],
    [resetWalletV2, "walletV2"]
  ];
  res.send(
    "<h2>reset:</h2>" +
      resets
        .map(r => {
          r[0]();
          return `<li>${r[1]}</li>`;
        })
        .join("<br/>")
  );
});

addHandler(publicRouter, "get", "/donate", (req, res) => {
  sendFile("assets/html/donate.html", res);
});

addHandler(publicRouter, "get", "/donations/availabledonations", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(readFileAsJSON(assetsFolder + "/data/availableDonations.json"));
});

const handleLollipopLoginRedirect = (
  res: Response<any, Record<string, any>>,
  samlRequest: string,
  thumbprint?: string
) => {
  const base64EncodedSAMLReq = zlib
    .deflateRawSync(samlRequest)
    .toString("base64");
  void debugSamlRequestIfNeeded(base64EncodedSAMLReq, thumbprint);

  const redirectUrl = `${loginLolliPopRedirect}?SAMLRequest=${encodeURIComponent(
    base64EncodedSAMLReq
  )}`;
  res.redirect(redirectUrl);
};

const debugSamlRequestIfNeeded = async (
  samlReq: string,
  thumbprint?: string
) => {
  if (!ioDevServerConfig.global.logSAMLRequest) {
    return;
  }

  const decoded = decodeURIComponent(samlReq);

  const deflated = zlib
    .inflateRawSync(Buffer.from(decoded, "base64"))
    .toString();

  console.log(chalk.bgBlack(chalk.green(`Deflated samlReq: ${deflated}`)));

  const xmlToJson = await parseStringPromise(deflated);

  const authnRequest = xmlToJson["samlp:AuthnRequest"];
  if (authnRequest) {
    console.log(
      chalk.bgBlack(
        chalk.green(`Authn Request Algorithm-Id: ${authnRequest.$.ID}`)
      )
    );
  }
  if (thumbprint) {
    console.log(chalk.bgBlack(chalk.green(`Stored Thumbprint: ${thumbprint}`)));
  }
};
