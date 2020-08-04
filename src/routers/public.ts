/**
 * this router serves all public API
 */
import { Router } from "express";
import { backendInfo, backendStatus } from "../payloads/backend";
import { loginSessionToken } from "../payloads/login";

export const publicRouter = Router();

publicRouter.get("/info", (_, res) => {
  res.json(backendInfo);
});

publicRouter.get("/ping", (_, res) => {
  res.send("ok");
});

publicRouter.post("/test-login", (_, res) => {
  res.json(loginSessionToken);
});

// backend service status
publicRouter.get("/status/backend.json", (_, res) => {
  res.json(backendStatus);
});
