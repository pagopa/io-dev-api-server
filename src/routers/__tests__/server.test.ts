import * as E from "fp-ts/lib/Either";
import supertest from "supertest";
import { PublicSession } from "../../../generated/definitions/backend/PublicSession";
import { loginSessionToken } from "../../payloads/login";
import { basePath } from "../../payloads/response";
import app from "../../server";

const request = supertest(app);

const testForPng = async (url: string) => {
  const response = await request.get(url);
  expect(response.status).toBe(200);
  expect(response.get("content-type")).toBe("image/png");
  return;
};

it("login should response with a welcome page", async done => {
  const response = await request.get("/login");
  expect(response.status).toBe(200);
  done();
});

it("login with auth should response with a redirect and the token as param", async done => {
  const response = await request.get("/login?authorized=1");
  expect(response.status).toBe(302);
  expect(response.text).toBe(
    "Found. Redirecting to /profile.html?token=" + loginSessionToken
  );
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
  expect(E.isRight(session)).toBeTruthy();
  done();
});

it("test-login /test-login should always return sessionToken", async done => {
  const result = await request.post("/test-login");

  expect(result.status).toBe(200);
  expect(result.body).toStrictEqual({ token: loginSessionToken });
  done();
});

it("Pay webview route should always response 200", async done => {
  await testForPng("/paywebview");
  done();
});

it("Route /assets/imgs/how_to_login.png should response 200", async done => {
  await testForPng("/assets/imgs/how_to_login.png");
  done();
});

it("Reset route should response 200 and contain reset text", async done => {
  const response = await request.get("/reset");
  expect(response.status).toBe(200);
  expect(response.text).toContain("<h2>reset:</h2>");
  done();
});
