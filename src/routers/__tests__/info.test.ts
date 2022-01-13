import * as E from "fp-ts/lib/Either";
import supertest from "supertest";
import { ServerInfo } from "../../../generated/definitions/backend/ServerInfo";
import app from "../../server";

const request = supertest(app);

it("info should return a valid ServerInfo object", async done => {
  const response = await request.get(`/info`);
  expect(response.status).toBe(200);
  const sr = ServerInfo.decode(response.body);
  expect(E.isRight(sr)).toBeTruthy();
  done();
});

it("Ping should return 200/ok", async done => {
  const response = await request.get("/ping");
  expect(response.status).toBe(200);
  expect(response.text).toBe("ok");
  done();
});
