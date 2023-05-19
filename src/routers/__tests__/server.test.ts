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
};

it("login should response with a welcome page", async () => {
  const response = await request.get("/login");
  expect(response.status).toBe(302);
});

it("login with auth should response with a redirect and the token as param", async () => {
  const response = await request.get("/idp-login?authorized=1");
  expect(response.status).toBe(302);
  expect(response.text).toBe(
    "Found. Redirecting to /profile.html?token=" + loginSessionToken
  );
});

it("logout should response 200", async () => {
  const response = await request.post("/logout");
  expect(response.status).toBe(200);
});

it("session should return a valid session", async () => {
  const response = await request.get(`${basePath}/session`);
  expect(response.status).toBe(200);
  const session = PublicSession.decode(response.body);
  expect(E.isRight(session)).toBeTruthy();
});

it("test-login /test-login should always return sessionToken", async () => {
  const result = await request.post("/test-login");

  expect(result.status).toBe(200);
  expect(result.body).toStrictEqual({ token: loginSessionToken });
});

it("Pay webview route should always response 200", async () => {
  await testForPng("/paywebview");
});

it("Route /assets/imgs/how_to_login.png should response 200", async () => {
  await testForPng("/assets/imgs/how_to_login.png");
});

it("Reset route should response 200 and contain reset text", async () => {
  const response = await request.get("/reset");
  expect(response.status).toBe(200);
  expect(response.text).toContain("<h2>reset:</h2>");
});
