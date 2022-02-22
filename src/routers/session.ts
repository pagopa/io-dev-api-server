import faker from "faker/locale/it";
import { Plugin } from "../core/server";

import { makeSession } from "../payloads/session";
import { addApiV1Prefix } from "../utils/strings";

export const SessionPlugin: Plugin = async ({
  handleRoute,
  getRandomValue
}) => {
  const session = makeSession(getRandomValue);

  handleRoute("get", addApiV1Prefix("/session"), (_, res) =>
    res.json(session.payload)
  );

  handleRoute("get", addApiV1Prefix("/token/support"), (_, res) =>
    res.json({
      access_token: getRandomValue("supportToken", faker.datatype.uuid()),
      expires_in: getRandomValue(180, faker.datatype.number())
    })
  );
};
