import supertest from "supertest";
import { PaginatedServiceTupleCollection } from "../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { basePath } from "../../generated/definitions/backend_api_paths";
import {
  ScopeEnum,
  Service
} from "../../generated/definitions/content/Service";
import app, { services } from "../server";
const request = supertest(app);

it("services should return a valid services list", async done => {
  const response = await request.get(`${basePath}/services`);
  expect(response.status).toBe(200);
  const list = PaginatedServiceTupleCollection.decode(response.body);
  expect(list.isRight()).toBeTruthy();
  if (list.isRight()) {
    expect(list.value).toEqual(services.payload);
  }
  done();
});

it("services should return a valid service with content", async done => {
  const serviceId = services.payload.items[0].service_id;
  const response = await request.get(`${basePath}/services/${serviceId}`);
  expect(response.status).toBe(200);
  const service = ServicePublic.decode(response.body);
  expect(service.isRight()).toBeTruthy();
  if (service.isRight()) {
    expect(service.value.service_id).toBe(serviceId);
  }
  done();
});

it("static_contents should return a valid service metadata", async done => {
  const serviceId = services.payload.items[0].service_id;
  const response = await request.get(
    `/static_contents/services/${serviceId}.json`
  );
  expect(response.status).toBe(200);
  const metadata = Service.decode(response.body);
  expect(metadata.isRight()).toBeTruthy();
  if (metadata.isRight()) {
    expect(metadata.value.scope).toEqual(ScopeEnum.LOCAL);
  }
  done();
});

it("static_contents should return a valid service logo", async done => {
  const response = await request.get(
    "/static_contents/logos/services/service_id"
  );
  expect(response.status).toBe(200);
  done();
});

// tslint:disable-next-line: no-identical-functions
it("static_contents should return a valid organization logo", async done => {
  const response = await request.get(
    "/static_contents/logos/organizations/organization_id"
  );
  expect(response.status).toBe(200);
  done();
});
