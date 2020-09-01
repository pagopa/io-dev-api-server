import { Router } from "express";
import { installHandler } from "../payloads/response";
import { sendFile } from "../utils/file";

export const miscRouter = Router();

installHandler(miscRouter, "get", "/test-cookies.html", (_, res) => {
  sendFile("assets/html/test_cookies.html", res);
  return null;
});
