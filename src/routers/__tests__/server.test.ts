import * as E from "fp-ts/lib/Either";

import { PublicSession } from "../../../generated/definitions/backend/PublicSession";
import { loginSessionToken } from "../../payloads/login";
import { basePath } from "../../payloads/response";

import supertest, { SuperTest, Test } from "supertest";

import {
  createIODevelopmentServer,
  defaultIODevelopmentOptions,
  IODevelomentServer
} from "../../server";

// tslint:disable-next-line:no-let
let request: SuperTest<Test>;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressInstance();
  request = supertest(app);
});

const testForPng = async (url: string) => {
  const response = await request.get(url);
  expect(response.status).toBe(200);
  expect(response.get("content-type")).toBe("image/png");
  return;
};

describe("/login", () => {
  it('should response with a welcome page when "auto login" is not enabled', async () => {
    const ioDevServerWithAutoLogin = createIODevelopmentServer({
      ...defaultIODevelopmentOptions,
      global: {
        autoLogin: false
      }
    });
    const appWithAutoLogin = await ioDevServerWithAutoLogin.toExpressInstance();
    const requestWithAutoLogin = supertest(appWithAutoLogin);

    const response = await requestWithAutoLogin.get("/login");
    expect(response.status).toBe(200);
  });

  it('should response with a redirect and the token as param when "auto-login" is enabled', async () => {
    const ioDevServerWithoutAutoLogin = createIODevelopmentServer({
      ...defaultIODevelopmentOptions,
      global: {
        autoLogin: true
      }
    });

    const appWithoutAutoLogin = await ioDevServerWithoutAutoLogin.toExpressInstance();
    const requestWithoutAutoLogin = supertest(appWithoutAutoLogin);

    const response = await requestWithoutAutoLogin.get("/login");
    expect(response.status).toBe(302);
    expect(response.text).toBe(
      "Found. Redirecting to /profile.html?token=" + loginSessionToken
    );
  });
});

it("login with auth should response with a redirect and the token as param", async () => {
  const response = await request.get("/login?authorized=1");
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
