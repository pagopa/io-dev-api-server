import * as E from "fp-ts/lib/Either";

import { EmailAddress } from "../../../generated/definitions/backend/EmailAddress";
import { InitializedProfile } from "../../../generated/definitions/backend/InitializedProfile";
import { Profile } from "../../../generated/definitions/backend/Profile";
import { UserMetadata } from "../../../generated/definitions/backend/UserMetadata";
import { Municipality } from "../../../generated/definitions/content/Municipality";

import { basePath } from "../../payloads/response";
import { mockUserMetadata } from "../../payloads/userMetadata";

import supertest, { SuperTest, Test } from "supertest";

import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { createIODevelopmentServer } from "../../server";

let request: SuperTest<Test>;
let fiscalCode: FiscalCode;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressInstance();
  request = supertest(app);
  fiscalCode = ioDevelopmentServer.loadedConfig.profile.attrs.fiscal_code;
});

it("profile should return a valid profile", async () => {
  const response = await request.get(`${basePath}/profile`);
  expect(response.status).toBe(200);
  const profile = InitializedProfile.decode(response.body);
  expect(E.isRight(profile)).toBeTruthy();
  if (E.isRight(profile)) {
    expect(profile.value.fiscal_code).toBe(fiscalCode);
  }
});

it("profile should return a valid updated profile (version increased)", async () => {
  const profile: Profile = {
    is_inbox_enabled: true,
    is_email_enabled: true,
    is_webhook_enabled: true,
    email: "new_email@email.it" as EmailAddress,
    version: 5
  };
  const response = await request
    .post(`${basePath}/profile`)
    .send(profile)
    .set("Content-Type", "application/json");

  expect(response.status).toBe(200);
  const updatedProfile = InitializedProfile.decode(response.body);
  if (E.isRight(updatedProfile)) {
    expect(updatedProfile.value.version).toBe(profile.version + 1);
  }
});

it("get user-metadata should return a valid user-metadata", async () => {
  const response = await request.get(`${basePath}/user-metadata`);
  expect(response.status).toBe(200);
  const usermetadata = UserMetadata.decode(response.body);
  expect(E.isRight(usermetadata)).toBeTruthy();
});

it("get municipality should return a valid municipality", async () => {
  const response = await request.get(
    `/static_contents/municipalities/A/B/CODE`
  );
  expect(response.status).toBe(200);
  const municipality = Municipality.decode(response.body);
  expect(E.isRight(municipality)).toBeTruthy();
});

it("post user-metadata should return the updated user-metadata", async () => {
  const response = await request
    .post(`${basePath}/user-metadata`)
    .send(mockUserMetadata)
    .set("Content-Type", "application/json");
  expect(response.status).toBe(200);
  const updatedUsermetadata = UserMetadata.decode(response.body);
  expect(E.isRight(updatedUsermetadata)).toBeTruthy();
  if (E.isRight(updatedUsermetadata)) {
    expect(updatedUsermetadata.value).toEqual(mockUserMetadata);
  }
});
