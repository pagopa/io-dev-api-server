/**
 * this router serves all public API
 */
import { Router } from "express";
import { backendInfo, backendStatus } from "../payloads/backend";

export const publicRouter = Router();

publicRouter.get("/info", (_, res) => {
  res.json(backendInfo);
});

publicRouter.get("/ping", (_, res) => {
  res.send("ok");
});

// backend service status
publicRouter.get("/status/backend.json", (_, res) => {
  res.json(backendStatus);
});
