import * as E from "fp-ts/lib/Either";

import { PaginatedServiceTupleCollection } from "../../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServicePublic } from "../../../generated/definitions/backend/ServicePublic";
import { staticContentRootPath } from "../../config";
import { basePath } from "../../payloads/response";

import { services, visibleServices } from "../service";

import supertest, { SuperTest, Test } from "supertest";

import { createIODevelopmentServer } from "../../server";

let request: SuperTest<Test>;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressApplication();
  request = supertest(app);
});

it("services should return a valid services list", async () => {
  const response = await request.get(`${basePath}/services`);
  expect(response.status).toBe(200);
  const list = PaginatedServiceTupleCollection.decode(response.body);

  expect(E.isRight(list)).toBeTruthy();
  if (E.isRight(list)) {
    expect(list.value).toEqual(visibleServices.payload);
  }
});

it("services should return a valid service with content", async () => {
  const serviceId = services[0].service_id;
  const response = await request.get(`${basePath}/services/${serviceId}`);
  expect(response.status).toBe(200);
  const service = ServicePublic.decode(response.body);
  expect(E.isRight(service)).toBeTruthy();
  if (E.isRight(service)) {
    expect(service.value.service_id).toBe(serviceId);
  }
});

it("static_contents should return a valid service logo", async () => {
  const response = await request.get(
    `${staticContentRootPath}/logos/services/service_id`
  );
  expect(response.status).toBe(200);
});

it("static_contents should return a valid organization logo", async () => {
  const response = await request.get(
    `${staticContentRootPath}/logos/organizations/organization_id`
  );
  expect(response.status).toBe(200);
});
