import * as E from "fp-ts/lib/Either";
import { ServerInfo } from "../../../generated/definitions/backend/ServerInfo";
import supertest, { SuperTest, Test } from "supertest";
import { createIODevelopmentServer } from "../../server";

let request: SuperTest<Test>;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressInstance();
  request = supertest(app);
});

it("info should return a valid ServerInfo object", async () => {
  const response = await request.get(`/info`);
  expect(response.status).toBe(200);
  const sr = ServerInfo.decode(response.body);
  expect(E.isRight(sr)).toBeTruthy();
});

it("Ping should return 200/ok", async () => {
  const response = await request.get("/ping");
  expect(response.status).toBe(200);
  expect(response.text).toBe("ok");
});
