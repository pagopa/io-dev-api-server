import supertest from "supertest";
import { addApiIdentityV1Prefix } from "../../utils/strings";
import app from "../../server";
const request = supertest(app);

it("email-validation-process should return status 202", async () => {
  const response = await request.post(
    addApiIdentityV1Prefix("/email-validation-process")
  );
  expect(response.status).toBe(202);
});
