/**
 * this router serves all public API (those ones don't need session)
 */
import { Router } from "express";
import { backendInfo, BackendStatus, backendStatus } from "../payloads/backend";
import { loginSessionToken, loginWithToken } from "../payloads/login";
import {
  allRegisteredRoutes,
  installCustomHandler,
  installHandler,
} from "../payloads/response";
import { ServerInfo } from "../../generated/definitions/backend/ServerInfo";
import { AccessToken } from "../../generated/definitions/backend/AccessToken";
import fs from "fs";
import { resetBonusVacanze } from "./features/bonus-vacanze";
import { resetProfile } from "./profile";

export const publicRouter = Router();

installCustomHandler(publicRouter, "get", "/login", (_, res) => {
  res.redirect(loginWithToken);
});
installCustomHandler(publicRouter, "post", "/logout", (_, res) => {
  res.status(200).send("ok");
});

installHandler(
  publicRouter,
  "get",
  "/info",
  () => ({
    payload: backendInfo,
  }),
  ServerInfo
);

// ping (no longer needed since actually app disables network status checking)
installHandler(publicRouter, "get", "/ping", () => ({
  payload: "ok",
  isJson: false,
}));

// test login
installHandler(
  publicRouter,
  "post",
  "/test-login",
  () => ({
    payload: { token: loginSessionToken },
  }),
  AccessToken
);

// backend service status
installHandler(
  publicRouter,
  "get",
  "/status/backend.json",
  () => ({
    payload: backendStatus,
  }),
  BackendStatus
);

// read package.json to print some info
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());
installCustomHandler(publicRouter, "get", "/", (_, res) => {
  res.send(
    `Hi. This is ${
      packageJson.name
    }<br/><br/>routes available:<br/>${allRegisteredRoutes("<br/>")}`
  );
});

// it should be useful to reset some states
installCustomHandler(publicRouter, "get", "/reset", (_, res) => {
  // reset profile
  // TO DO RESTORE
  // currentProfile = getProfile(fiscalCode).payload;
  // reset user shoice
  resetProfile();
  resetBonusVacanze();
  const resets = ["bonus vacanze", "user delete/download"];
  res.send(
    "<h2>reset:</h2>" + resets.map((r) => `<li>${r}</li>`).join("<br/>")
  );
});
