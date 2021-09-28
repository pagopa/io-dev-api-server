import { Router } from "express";
import { ioDevServerConfig } from "../config";
import { addHandler } from "../payloads/response";
import { sendFile } from "../utils/file";

export const miscRouter = Router();

addHandler(miscRouter, "get", "/myportal_playground.html", (_, res) => {
  sendFile("assets/html/myportal_playground.html", res);
});

/**
 * API dedicated to dev- server
 * return the current dev-server configuration
 */
addHandler(miscRouter, "get", "/config", (_, res) => {
  res.json(ioDevServerConfig);
});
