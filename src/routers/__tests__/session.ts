import * as E from "fp-ts/lib/Either";

import { PublicSession } from "../../../generated/definitions/backend/PublicSession";
import { basePath } from "../../payloads/response";
import { session } from "../../payloads/session";

import supertest, { SuperTest, Test } from "supertest";

import { createIODevelopmentServer } from "../../server";

let request: SuperTest<Test>;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressInstance();
  request = supertest(app);
});

it("services should return a valid public session", async () => {
  const response = await request.get(`${basePath}/session`);
  expect(response.status).toBe(200);
  const publicSession = PublicSession.decode(response.body);

  expect(E.isRight(publicSession)).toBeTruthy();
  if (E.isRight(publicSession)) {
    expect(publicSession.value).toEqual(session.payload);
  }
});
