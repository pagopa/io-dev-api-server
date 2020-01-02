import { NonEmptyString } from "italia-ts-commons/lib/strings";
import supertest from "supertest";
import { CreatedMessageWithoutContent } from "../../generated/definitions/backend/CreatedMessageWithoutContent";
import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";
import { FiscalCode } from "../../generated/definitions/backend/FiscalCode";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { PaginatedCreatedMessageWithoutContentCollection } from "../../generated/definitions/backend/PaginatedCreatedMessageWithoutContentCollection";
import { PaginatedServiceTupleCollection } from "../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { PublicSession } from "../../generated/definitions/backend/PublicSession";
import { ServerInfo } from "../../generated/definitions/backend/ServerInfo";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { UserMetadata } from "../../generated/definitions/backend/UserMetadata";
import { UserProfile } from "../../generated/definitions/backend/UserProfile";
import { basePath } from "../../generated/definitions/backend_api_paths";
import app, { fiscalCode, messages, services } from "../server";

const request = supertest(app);

it("Ping should return 200/ok", async done => {
  const response = await request.get("/ping");

  expect(response.status).toBe(200);
  expect(response.text).toBe("ok");
  done();
});

it("info should return a valid ServerInfo object", async done => {
  const response = await request.get("/info");

  expect(response.status).toBe(200);
  const backendInfo = ServerInfo.decode(response.body);
  expect(backendInfo.isRight()).toBeTruthy();
  done();
});

it("login should response with a redirect and the token as param", async done => {
  const response = await request.get("/login");
  expect(response.redirect).toBeTruthy();
  expect(response.header.location).toContain("profile.html?token=");
  done();
});

it("logout should response 200", async done => {
  const response = await request.post("/logout");
  expect(response.status).toBe(200);
  done();
});

it("session should return a valid session", async done => {
  const response = await request.get(`${basePath}/session`);
  expect(response.status).toBe(200);
  const session = PublicSession.decode(response.body);
  expect(session.isRight()).toBeTruthy();
  done();
});

it("session should return a valid profile", async done => {
  const response = await request.get(`${basePath}/profile`);
  expect(response.status).toBe(200);
  const profile = UserProfile.decode(response.body);
  expect(profile.isRight()).toBeTruthy();
  if (profile.isRight()) {
    expect(profile.value.fiscal_code).toBe(fiscalCode);
  }
  done();
});

it("session should return a valid updated profile (version increased)", async done => {
  const profile: InitializedProfile = {
    is_inbox_enabled: true,
    is_webhook_enabled: true,
    family_name: "Red",
    name: "Blue",
    fiscal_code: fiscalCode as FiscalCode,
    has_profile: true,
    spid_email: "email@spid.it" as EmailAddress,
    version: 5,
    spid_mobile_phone: "5555555" as NonEmptyString
  };
  const response = await request
    .post(`${basePath}/profile`)
    .send(profile)
    .set("Content-Type", "application/json");

  expect(response.status).toBe(200);
  const updatedProfile = InitializedProfile.decode(response.body);
  expect(updatedProfile.isRight()).toBeTruthy();
  if (updatedProfile.isRight()) {
    expect(updatedProfile.value.version).toBe(profile.version + 1);
  }
  done();
});

it("session should return a valid user-metadata", async done => {
  const response = await request.get(`${basePath}/user-metadata`);
  expect(response.status).toBe(200);
  const usermetadata = UserMetadata.decode(response.body);
  expect(usermetadata.isRight()).toBeTruthy();
  done();
});

it("session should return a valid messages list", async done => {
  const response = await request.get(`${basePath}/messages`);
  expect(response.status).toBe(200);
  const list = PaginatedCreatedMessageWithoutContentCollection.decode(
    response.body
  );
  expect(list.isRight()).toBeTruthy();
  if (list.isRight()) {
    expect(list.value).toEqual(messages.payload);
  }
  done();
});

it("session should return a valid message with content", async done => {
  const messageId = messages.payload.items[0].id;
  const response = await request.get(`${basePath}/messages/${messageId}`);
  expect(response.status).toBe(200);
  const message = CreatedMessageWithoutContent.decode(response.body);
  expect(message.isRight()).toBeTruthy();
  if (message.isRight()) {
    expect(message.value.id).toBe(messageId);
  }
  done();
});

it("session should return a valid services list", async done => {
  const response = await request.get(`${basePath}/services`);
  expect(response.status).toBe(200);
  const list = PaginatedServiceTupleCollection.decode(response.body);
  expect(list.isRight()).toBeTruthy();
  if (list.isRight()) {
    expect(list.value).toEqual(services.payload);
  }
  done();
});

it("session should return a valid service with content", async done => {
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
