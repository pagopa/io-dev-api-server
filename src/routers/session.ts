import faker from "faker/locale/it";
import { Plugin } from "../core/server";

import { session } from "../payloads/session";
import { getRandomValue } from "../utils/random";
import { addApiV1Prefix } from "../utils/strings";

export const SessionPlugin: Plugin = async ({ handleRoute }) => {
  handleRoute("get", addApiV1Prefix("/session"), (_, res) =>
    res.json(session.payload)
  );

  handleRoute("get", addApiV1Prefix("/token/support"), (_, res) =>
    res.json({
      access_token: getRandomValue(
        "supportToken",
        faker.datatype.uuid(),
        "global"
      ),
      expires_in: getRandomValue(180, faker.datatype.number(), "global")
    })
  );
};
