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

addHandler(sessionRouter, "get", addApiV1Prefix("/token/support"), (_, res) =>
  res.json({
    access_token: faker.random.uuid(),
    expires_in: faker.random.number()
  })
);
