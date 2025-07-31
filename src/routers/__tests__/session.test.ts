import * as E from "fp-ts/lib/Either";
import supertest from "supertest";
import { PublicSession } from "../../../generated/definitions/session_manager/PublicSession";
import { basePath } from "../../payloads/response";
import {
  createOrRefreshSessionTokens,
  getCustomSession
} from "../../payloads/session";
import app from "../../server";

const request = supertest(app);
it("services should return a 500 error for public session", async () => {
  const response = await request.get(`${basePath}/session`);
  expect(response.status).toBe(401);
});

it("services should return a valid public session", async () => {
  createOrRefreshSessionTokens();
  const response = await request.get(`${basePath}/session`);
  expect(response.status).toBe(200);
  const publicSession = PublicSession.decode(response.body);

  expect(E.isRight(publicSession)).toBeTruthy();
  if (E.isRight(publicSession)) {
    const customSession = getCustomSession();
    expect(publicSession.right).toEqual(customSession?.payload);
  }
});
