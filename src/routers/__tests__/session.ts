import * as E from "fp-ts/lib/Either";
import supertest from "supertest";
import { PublicSession } from "../../../generated/definitions/backend/PublicSession";
import { basePath } from "../../payloads/response";
import {
  createOrRefreshSessionTokens,
  getCustomSession
} from "../../payloads/session";
import app from "../../server";

const request = supertest(app);
it("services should return a valid public session", async () => {
  createOrRefreshSessionTokens();
  const response = await request.get(`${basePath}/session`);
  expect(response.status).toBe(200);
  const publicSession = PublicSession.decode(response.body);

  expect(E.isRight(publicSession)).toBeTruthy();
  if (E.isRight(publicSession)) {
    expect(publicSession.right).toEqual(getCustomSession().payload);
  }
});
