import { Router } from "express";
import { installHandler } from "../payloads/response";
import { session } from "../payloads/session";
import { addApiV1Prefix } from "../utils/strings";

export const sessionRouter = Router();

installHandler(sessionRouter, "get", addApiV1Prefix("/session"), _ => session);
