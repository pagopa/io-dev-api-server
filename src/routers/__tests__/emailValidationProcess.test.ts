import { basePath } from "../../payloads/response";

import supertest, { SuperTest, Test } from "supertest";

import { createIODevelopmentServer } from "../../server";

let request: SuperTest<Test>;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressInstance();
  request = supertest(app);
});

it("email-validation-process should return status 202", async () => {
  const response = await request.post(`${basePath}/email-validation-process`);
  expect(response.status).toBe(202);
});
