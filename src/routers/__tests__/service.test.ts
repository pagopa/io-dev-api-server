import * as E from "fp-ts/lib/Either";
import supertest from "supertest";
import { PaginatedServiceTupleCollection } from "../../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServicePublic } from "../../../generated/definitions/backend/ServicePublic";
import { ioDevServerConfig, staticContentRootPath } from "../../config";
import { basePath } from "../../payloads/response";
import app from "../../server";
import ServiceDB from "./../../persistence/services";

const request = supertest(app);

beforeAll(() => {
  return ServiceDB.createServices(ioDevServerConfig);
});

afterAll(() => {
  return ServiceDB.deleteServices();
});

it("services should return a valid services list", async () => {
  const response = await request.get(`${basePath}/services`);
  expect(response.status).toBe(200);
  const list = PaginatedServiceTupleCollection.decode(response.body);
  expect(E.isRight(list)).toBeTruthy();
  if (E.isRight(list)) {
    const visibleServices = ServiceDB.getVisibleServices();
    expect(list.right).toEqual(visibleServices.payload);
  }
});

it("services should return a valid service with content", async () => {
  const services = ServiceDB.getServices();
  const serviceId = services[0].service_id;
  const response = await request.get(`${basePath}/services/${serviceId}`);
  expect(response.status).toBe(200);
  const service = ServicePublic.decode(response.body);
  expect(E.isRight(service)).toBeTruthy();
  if (E.isRight(service)) {
    expect(service.right.service_id).toBe(serviceId);
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
