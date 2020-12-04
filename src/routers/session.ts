import { Router } from "express";
import * as faker from "faker/locale/it";
import { addHandler } from "../payloads/response";
import { session } from "../payloads/session";
import { addApiV1Prefix } from "../utils/strings";
import { toPayload } from "../utils/validator";
export const sessionRouter = Router();

addHandler(sessionRouter, "get", addApiV1Prefix("/session"), (_, res) =>
  res.json(session.payload)
);

// TODO replace with the relative generated codec when all specs will be updated
addHandler(sessionRouter, "get", addApiV1Prefix("/token/support"), _ =>
  toPayload({
    access_token: faker.random.uuid(),
    expires_in: faker.random.number()
  })
);
