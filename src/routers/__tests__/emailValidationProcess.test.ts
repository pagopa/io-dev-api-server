import supertest from "supertest";
import app from "../../server";
import { basePath } from "../../payloads/response";

const request = supertest(app);

it("email-validation-process should return status 202", async done => {
  const response = await request.post(`${basePath}/email-validation-process`);
  expect(response.status).toBe(202);
  done();
});
