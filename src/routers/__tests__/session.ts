import supertest from "supertest";
import { PublicSession } from "../../../generated/definitions/backend/PublicSession";
import { basePath } from "../../payloads/response";
import { session } from "../../payloads/session";
import app from "../../server";

const request = supertest(app);
it("services should return a valid public session", async done => {
  const response = await request.get(`${basePath}/session`);
  expect(response.status).toBe(200);
  const publicSession = PublicSession.decode(response.body);

  expect(publicSession.isRight()).toBeTruthy();
  if (publicSession.isRight()) {
    expect(publicSession.value).toEqual(session.payload);
  }
  done();
});
