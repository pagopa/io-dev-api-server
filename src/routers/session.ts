import { Router } from "express";
import * as faker from "faker/locale/it";
import { installHandler } from "../payloads/response";
import { session } from "../payloads/session";
import { addApiV1Prefix } from "../utils/strings";
import { toPayload } from "../utils/validator";
export const sessionRouter = Router();

installHandler(sessionRouter, "get", addApiV1Prefix("/session"), _ => session);

// TODO replace with the relative generated codec when all specs will be updated
installHandler(sessionRouter, "get", addApiV1Prefix("/token"), _ =>
  toPayload({
    access_token: faker.random.uuid(),
    expires_in: faker.random.number()
  })
);
