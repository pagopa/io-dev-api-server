import { Router } from "express";
import { faker } from "@faker-js/faker/locale/it";
import { addHandler } from "../payloads/response";
import { getCustomSession } from "../payloads/session";
import { getAssertionRef } from "../persistence/lollipop";
import { getRandomValue } from "../utils/random";
import { addApiV1Prefix } from "../utils/strings";
export const sessionRouter = Router();

addHandler(sessionRouter, "get", addApiV1Prefix("/session"), (_, res) => {
  const payload = {
    ...getCustomSession().payload,
    lollipopAssertionRef: getAssertionRef()
  };
  return res.json(payload);
});

addHandler(sessionRouter, "get", addApiV1Prefix("/token/support"), (_, res) =>
  res.json({
    access_token: getRandomValue(
      "supportToken",
      faker.datatype.uuid(),
      "global"
    ),
    expires_in: getRandomValue(180, faker.datatype.number(), "global")
  })
);
