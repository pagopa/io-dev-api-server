/**
 * this router serves all public API (those ones don't need session)
 */
import { Router } from "express";
import { backendInfo, backendStatus } from "../payloads/backend";
import { loginSessionToken, loginWithToken } from "../payloads/login";
import { addHandler } from "../payloads/response";
import { sendFile } from "../utils/file";
import { resetBpd } from "./features/bdp";
import { resetBonusVacanze } from "./features/bonus-vacanze";
import { resetCgn } from "./features/cgn";
import { resetProfile } from "./profile";
import { resetWalletV2 } from "./walletsV2";

export const publicRouter = Router();

addHandler(publicRouter, "get", "/login", (req, res) => {
  if (req.query.authorized && req.query.authorized === "1") {
    res.redirect(loginWithToken);
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

// backend service status
addHandler(publicRouter, "get", "/status/backend.json", (_, res) =>
  res.json(backendStatus)
);

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
