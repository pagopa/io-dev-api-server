/**
 * this router serves all public API (those ones don't need session)
 */
import { Router } from "express";
import fs from "fs";
import { AccessToken } from "../../generated/definitions/backend/AccessToken";
import { ServerInfo } from "../../generated/definitions/backend/ServerInfo";
import { backendInfo, BackendStatus, backendStatus } from "../payloads/backend";
import { loginSessionToken, loginWithToken } from "../payloads/login";
import {
  installCustomHandler,
  installHandler,
  routes
} from "../payloads/response";
import { sendFile } from "../utils/file";
import { resetBpd } from "./features/bdp";
import { resetBonusVacanze } from "./features/bonus-vacanze";
import { resetProfile } from "./profile";

export const publicRouter = Router();

installCustomHandler(publicRouter, "get", "/login", (req, res) => {
  if (req.query.authorized && req.query.authorized === "1") {
    res.redirect(loginWithToken);
    return;
  }
  sendFile("assets/html/login.html", res);
});

installCustomHandler(
  publicRouter,
  "get",
  "/assets/imgs/how_to_login.png",
  (_, res) => {
    sendFile("assets/imgs/how_to_login.png", res);
  }
);

installCustomHandler(publicRouter, "post", "/logout", (_, res) => {
  res.status(200).send({ message: "ok" });
});

installHandler(
  publicRouter,
  "get",
  "/info",
  () => ({
    payload: backendInfo
  }),
  ServerInfo
);

// ping (no longer needed since actually app disables network status checking)
installHandler(publicRouter, "get", "/ping", () => ({
  payload: "ok",
  isJson: false
}));

// test login
installHandler(
  publicRouter,
  "post",
  "/test-login",
  () => ({
    payload: { token: loginSessionToken }
  }),
  AccessToken
);

// backend service status
installHandler(
  publicRouter,
  "get",
  "/status/backend.json",
  () => ({
    payload: backendStatus
  }),
  BackendStatus
);

// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
installCustomHandler(publicRouter, "get", "/", (_, res) => {
  const rr = routes.map(r => `<li>[${r.method}] ${r.path}</li>`);
  console.log(rr);
  res.send(
    `Hi. This is ${
      packageJson.name
    }<br/><br/><h3>routes available</h3><br/>${rr.join("")}`
  );
});

// it should be useful to reset some states
installCustomHandler(publicRouter, "get", "/reset", (_, res) => {
  type emptyFunc = () => void;
  const resets: ReadonlyArray<readonly [emptyFunc, string]> = [
    [resetProfile, "bonus vacanze"],
    [resetBonusVacanze, "user delete/download"],
    [resetBpd, "bdp"]
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
