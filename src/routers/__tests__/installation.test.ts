import * as E from "fp-ts/lib/Either";

import { SuccessResponse } from "../../../generated/definitions/backend/SuccessResponse";
import { basePath } from "../../payloads/response";

import supertest, { SuperTest, Test } from "supertest";

import { createIODevelopmentServer } from "../../server";

let request: SuperTest<Test>;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressInstance();
  request = supertest(app);
});

it("should return 200", async () => {
  const response = await request.put(
    `${basePath}/installations/MY_FANCY_TOKEN`
  );
  expect(response.status).toBe(200);
  const sr = SuccessResponse.decode(response.body);
  expect(E.isRight(sr)).toBeTruthy();
});
