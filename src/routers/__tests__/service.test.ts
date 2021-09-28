import supertest from "supertest";
import { PaginatedServiceTupleCollection } from "../../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServicePublic } from "../../../generated/definitions/backend/ServicePublic";
import { staticContentRootPath } from "../../config";
import { basePath } from "../../payloads/response";
import app from "../../server";
import { services, visibleServices } from "../service";
const request = supertest(app);

it("services should return a valid services list", async done => {
  const response = await request.get(`${basePath}/services`);
  expect(response.status).toBe(200);
  const list = PaginatedServiceTupleCollection.decode(response.body);
  expect(list.isRight()).toBeTruthy();
  if (list.isRight()) {
    expect(list.value).toEqual(visibleServices.payload);
  }
  done();
});

it("services should return a valid service with content", async done => {
  const serviceId = services[0].service_id;
  const response = await request.get(`${basePath}/services/${serviceId}`);
  expect(response.status).toBe(200);
  const service = ServicePublic.decode(response.body);
  expect(service.isRight()).toBeTruthy();
  if (service.isRight()) {
    expect(service.value.service_id).toBe(serviceId);
  }
  done();
});

it("static_contents should return a valid service logo", async done => {
  const response = await request.get(
    `${staticContentRootPath}/logos/services/service_id`
  );
  expect(response.status).toBe(200);
  done();
});

it("static_contents should return a valid organization logo", async done => {
  const response = await request.get(
    `${staticContentRootPath}/logos/organizations/organization_id`
  );
  expect(response.status).toBe(200);
  done();
});
