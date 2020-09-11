import supertest from "supertest";
import { PublicSession } from "../../../generated/definitions/backend/PublicSession";
import { basePath } from "../../../generated/definitions/backend_api_paths";
import app from "../../server";

const request = supertest(app);

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
