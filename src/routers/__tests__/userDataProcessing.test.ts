import supertest from "supertest";
import { ProblemJson } from "../../../generated/definitions/backend/ProblemJson";
import { UserDataProcessing } from "../../../generated/definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../generated/definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../generated/definitions/backend/UserDataProcessingStatus";
import { basePath } from "../../payloads/response";
import app from "../../server";

const request = supertest(app);
/* tslint:disable */
it("info should return ProblemJson with not found", async () => {
  const response = await request.get(
    `${basePath}/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
  );
  expect(response.status).toBe(404);
  const sr = ProblemJson.decode(response.body);
  expect(sr.isRight()).toBeTruthy();
});

it("Delete should return conflict error if DELETE status is undefined", async () => {
  const response = await request.delete(
    `${basePath}/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
  );
  expect(response.status).toBe(409);
});

it("Post should create a pending operation", async () => {
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
});

it("Delete should set the request as aborted if the choice is DELETE and status is PENDING", async () => {
  const response = await request.delete(
    `${basePath}/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
  );
  expect(response.status).toBe(202);

  const newStatus = await request.get(
    `${basePath}/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
  );
  const aborted: UserDataProcessing = {
    choice: UserDataProcessingChoiceEnum.DELETE,
    status: UserDataProcessingStatusEnum.ABORTED,
    version: 1
  };
  const sr = UserDataProcessing.decode(newStatus.body);
  expect(sr.isRight()).toBeTruthy();
  expect(sr.value).toEqual(aborted);
});

it("Delete should return conflict error if choice is DOWNLOAD", async () => {
  const response = await request.delete(
    `${basePath}/user-data-processing/${UserDataProcessingChoiceEnum.DOWNLOAD}`
  );
  expect(response.status).toBe(409);
});

it("Delete should return conflict error if DELETE status is ABORTED", async () => {
  const response = await request.delete(
    `${basePath}/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
  );
  expect(response.status).toBe(409);
});
