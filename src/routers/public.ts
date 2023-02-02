/**
 * this router serves all public API (those ones don't need session)
 */
import { JwkPublicKey, parseJwkOrError } from "@pagopa/ts-commons/lib/jwk";
import { Router } from "express";
import * as faker from "faker";
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

const test = async () => {
  const samlReq =
    "rVRNb5tAEL3nV1jc%2BTBpq2pliFxbbaicltpOD7mtYUjWhl28M9hOfn0XTB1HxU4VhQtoefvmzcybGVztiry3AY1CycDqO551FV4MkBd5yYYVPcgprCtA6hmcRNb8CKxKS6Y4CmSSF4CMEjYb3kyY73is1IpUonLrotfxROPAur5D%2BjyWK%2BTfbIXL1fpjxjfR90nuDePs5umJZ%2BulqlKu%2FKib5PdfvSbeiTCIFUQSiUsyMM%2B%2FtL2%2B7Xvzvse8S%2FbBdz553l333bhN4IuQqZD357Nd7EHIrufz2I5%2FzubdpGNTQyE5NbIfiEpkrlsqJBCp07wdQe5SpXaGLqJC0BuRgIZUaEiom%2FSr0gk0XQos0hV0o4ZoyOrAIyWxKkDP9ty308mzFF6W9oInK5CpI5TRwnPBa0n8xO0TsYi0WFQEe7SpTAuPZAq7wDrRrrA5bWzHmtbpI7%2Bdb8BBXwfzD4P%2BVZlMMgH69Vw7GEyFC07nFdQnwvStgTKQJOixgyp8LfzAPcr%2FqCIlq%2FOIxrHKRfL4XoP4tuxIc4nC5Hia1H0hvV0fkDY2Na4g2L3bMnnxjFRRci2wHjBjPFFUxX%2FcCg%2BQvfuOZY5yY64pZG%2Fw4qHZ2%2B3WwdLM%2BL3a1OM0M98Tv211V7C2eu6Z8pkF7f67ocM%2F";

  const decoded = decodeURIComponent(samlReq);
  const deflated = zlib
    .inflateRawSync(Buffer.from(decoded, "base64"))
    .toString();

  console.log(deflated);

  const xmlToJson = await parseStringPromise(deflated);

  const authnRequest = xmlToJson["samlp:AuthnRequest"];

  if (authnRequest) {
    console.log(authnRequest.$.ID);
    console.log(thumbprint);
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

      const samlRequest = getSamlRequest(thumbprint);

      const authNRequest = zlib.deflateRawSync(samlRequest).toString("base64");

      const redirectUrl = `${loginLolliPopRedirect}?SAMLRequest=${encodeURIComponent(
        authNRequest
      )}`;
      res.redirect(redirectUrl);
      return;
    } else {
      res.sendStatus(500);
      return;
    }
  }

  const id = faker.datatype.uuid();
  const samlRequest = getSamlRequest(id);

  const authNRequest = zlib.deflateRawSync(samlRequest).toString("base64");
  res.redirect(
    `${loginLolliPopRedirect}?SAMLRequest=${encodeURIComponent(authNRequest)}`
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
