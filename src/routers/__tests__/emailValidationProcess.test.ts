import supertest from "supertest";
import { basePath } from "../../payloads/response";
import app from "../../server";
const request = supertest(app);

it("email-validation-process should return status 202", async () => {
  const response = await request.post(`${basePath}/email-validation-process`);
  expect(response.status).toBe(202);
});
