import * as E from "fp-ts/lib/Either";

import { BackendStatus } from "../../../generated/definitions/content/BackendStatus";
import { Zendesk } from "../../../generated/definitions/content/Zendesk";
import { staticContentRootPath } from "../../config";

import supertest, { SuperTest, Test } from "supertest";

import { createIODevelopmentServer } from "../../server";

let request: SuperTest<Test>;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressInstance();
  request = supertest(app);
});

it("info should return a valid backendStatus object", async () => {
  const response = await request.get(
    `${staticContentRootPath}/status/backend.json`
  );
  expect(response.status).toBe(200);
  const bs = BackendStatus.decode(response.body);
  expect(E.isRight(bs)).toBeTruthy();
});

it("info should return a valid zendesk config object", async () => {
  const response = await request.get(
    `${staticContentRootPath}/assistanceTools/zendesk.json`
  );
  expect(response.status).toBe(200);
  const bs = Zendesk.decode(response.body);
  expect(E.isRight(bs)).toBeTruthy();
});
