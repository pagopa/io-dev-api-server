import { Router } from "express";
import { faker } from "@faker-js/faker/locale/it";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { addHandler } from "../payloads/response";
import { getCustomSession } from "../payloads/session";
import { getAssertionRef } from "../persistence/lollipop";
import { getRandomValue } from "../utils/random";
import { addApiV1Prefix } from "../utils/strings";
export const sessionRouter = Router();

addHandler(sessionRouter, "get", addApiV1Prefix("/session"), (_, res) =>
  pipe(
    getCustomSession(),
    O.fromNullable,
    O.fold(
      () => res.sendStatus(401),
      customSession =>
        res.json({
          ...customSession.payload,
          lollipopAssertionRef: getAssertionRef()
        })
    )
  )
);

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
