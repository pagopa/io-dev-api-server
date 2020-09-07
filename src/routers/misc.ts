import { Router } from "express";
import { installCustomHandler } from "../payloads/response";
import { sendFile } from "../utils/file";

export const miscRouter = Router();

installCustomHandler(
  miscRouter,
  "get",
  "/myportal_playground.html",
  (_, res) => {
    sendFile("assets/html/myportal_playground.html", res);
  }
);
