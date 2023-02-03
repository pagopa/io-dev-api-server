/**
 * this router serves all public API (those ones don't need session)
 */
import { JwkPublicKey, parseJwkOrError } from "@pagopa/ts-commons/lib/jwk";
import { Router } from "express";
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

export const publicRouter = Router();

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM = "sha256";

let thumbprint: string;
let samlReq: string;

const test = async () => {
  const decoded = decodeURIComponent(samlReq);

  const deflated = zlib
    .inflateRawSync(Buffer.from(decoded, "base64"))
    .toString();

  console.log(deflated);

  const xmlToJson = await parseStringPromise(deflated);

  const authnRequest = xmlToJson["samlp:AuthnRequest"];

  if (authnRequest) {
    console.log("authn req id", authnRequest.$.ID);
    console.log("stored thumb", thumbprint);
  }
};

addHandler(publicRouter, "get", "/login", async (req, res) => {
  if (
    req.headers["x-pagopa-lollipop-pub-key"] &&
    req.headers["x-pagopa-lollipop-pub-key-hash-algo"]
  ) {
    const jwkPK = parseJwkOrError(
      req.headers["x-pagopa-lollipop-pub-key"] as string
    );

    if (E.isRight(jwkPK) && JwkPublicKey.is(jwkPK.right)) {
      thumbprint = await jose.calculateJwkThumbprint(
        jwkPK.right,
        DEFAULT_LOLLIPOP_HASH_ALGORITHM
      );

      samlReq = zlib
        .deflateRawSync(getSamlRequest(thumbprint))
        .toString("base64");

      const redirectUrl = `${loginLolliPopRedirect}?SAMLRequest=${encodeURIComponent(
        samlReq
      )}`;
      res.redirect(redirectUrl);
      return;
    } else {
      res.sendStatus(500);
      return;
    }
  }

  samlReq = zlib.deflateRawSync(getSamlRequest()).toString("base64");

  res.redirect(
    `${loginLolliPopRedirect}?SAMLRequest=${encodeURIComponent(samlReq)}`
  );
  return;
});

addHandler(publicRouter, "get", "/idp-login", (req, res) => {
  test();
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
