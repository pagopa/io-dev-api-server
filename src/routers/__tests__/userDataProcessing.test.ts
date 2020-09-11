import supertest from "supertest";
import { ProblemJson } from "../../../generated/definitions/backend/ProblemJson";
import { UserDataProcessing } from "../../../generated/definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../generated/definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../generated/definitions/backend/UserDataProcessingStatus";
import { basePath } from "../../../generated/definitions/backend_api_paths";
import app from "../../server";

const request = supertest(app);

it("info should return ProblemJson with not found", async done => {
  const response = await request.get(
    `${basePath}/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
  );
  expect(response.status).toBe(404);
  const sr = ProblemJson.decode(response.body);
  expect(sr.isRight()).toBeTruthy();
  done();
});

it("Post should create a pending operation", async done => {
  const response = await request
    .post(`${basePath}/user-data-processing`)
    .send({ choice: UserDataProcessingChoiceEnum.DELETE })
    .set("Content-Type", "application/json");
  expect(response.status).toBe(200);
  const pending: UserDataProcessing = {
    choice: UserDataProcessingChoiceEnum.DELETE,
    status: UserDataProcessingStatusEnum.PENDING,
    version: 1
  };
  const sr = UserDataProcessing.decode(response.body);
  expect(sr.isRight()).toBeTruthy();
  expect(sr.value).toEqual(pending);
  done();
});
