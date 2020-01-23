import supertest from "supertest";
import { SuccessResponse } from "../../generated/definitions/backend/SuccessResponse";
import { basePath } from "../../generated/definitions/backend_api_paths";
import app from "../server";

const request = supertest(app);

it("should return 200", async done => {
  const response = await request.put(
    `${basePath}/installations/MY_FANCY_TOKEN`
  );
  expect(response.status).toBe(200);
  const sr = SuccessResponse.decode(response.body);
  expect(sr.isRight()).toBeTruthy();
  done();
});
