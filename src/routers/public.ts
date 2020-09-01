/**
 * this router serves all public API (those ones don't need session)
 */
import { Router } from "express";
import { backendInfo, BackendStatus, backendStatus } from "../payloads/backend";
import { loginSessionToken } from "../payloads/login";
import { installHandler } from "../payloads/response";
import { ServerInfo } from "../../generated/definitions/backend/ServerInfo";
import { AccessToken } from "../../generated/definitions/backend/AccessToken";

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
