import supertest from "supertest";
import { PublicSession } from "../../generated/definitions/backend/PublicSession";
import { ServerInfo } from "../../generated/definitions/backend/ServerInfo";
import { basePath } from "../../generated/definitions/backend_api_paths";
import app from "../server";

const request = supertest(app);

it("Ping should return 200/ok", async done => {
  const response = await request.get("/ping");

  expect(response.status).toBe(200);
  expect(response.text).toBe("ok");
  done();
});

it("info should return a valid ServerInfo object", async done => {
  const response = await request.get("/info");

  expect(response.status).toBe(200);
  const backendInfo = ServerInfo.decode(response.body);
  expect(backendInfo.isRight()).toBeTruthy();
  done();
});

it("login should response with a redirect and the token as param", async done => {
  const response = await request.get("/login");
  expect(response.redirect).toBeTruthy();
  expect(response.header.location).toContain("profile.html?token=");
  done();
});

it("logout should response 200", async done => {
  const response = await request.post("/logout");
  expect(response.status).toBe(200);
  done();
});

it("session should return a valid session", async done => {
  const response = await request.get(`${basePath}/session`);
  expect(response.status).toBe(200);
  const session = PublicSession.decode(response.body);
  expect(session.isRight()).toBeTruthy();
  done();
});
