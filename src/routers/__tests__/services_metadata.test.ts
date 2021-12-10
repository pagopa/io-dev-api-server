import supertest from "supertest";
import { BackendStatus } from "../../../generated/definitions/content/BackendStatus";
import { Zendesk } from "../../../generated/definitions/content/Zendesk";
import { staticContentRootPath } from "../../config";
import app from "../../server";

const request = supertest(app);

it("info should return a valid backendStatus object", async done => {
  const response = await request.get(
    `${staticContentRootPath}/status/backend.json`
  );
  expect(response.status).toBe(200);
  const bs = BackendStatus.decode(response.body);
  expect(bs.isRight()).toBeTruthy();
  done();
});

it("info should return a valid zendesk config object", async done => {
  const response = await request.get(
    `${staticContentRootPath}/assistanceTools/zendesk.json`
  );
  expect(response.status).toBe(200);
  const bs = Zendesk.decode(response.body);
  expect(bs.isRight()).toBeTruthy();
  done();
});
