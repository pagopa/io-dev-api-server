import { Router } from "express";
import { installCustomHandler } from "../payloads/response";
import { sendFile } from "../utils/file";

export const miscRouter = Router();

installCustomHandler(miscRouter, "get", "/test-cookies.html", (_, res) => {
  sendFile("assets/html/test_cookies.html", res);
});
