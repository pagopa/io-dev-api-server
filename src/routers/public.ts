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
import app from "../server";
import fs from "fs";

export const publicRouter = Router();

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
    }<br/><br/>routes availables:<br/>${allRegisteredRoutes("<br/>")}`
  );
});

installCustomHandler(publicRouter, "get", "/login", (_, res) => {
  res.redirect(loginWithToken);
});
installCustomHandler(publicRouter, "post", "/logout", (_, res) => {
  res.status(200).send("ok");
});
