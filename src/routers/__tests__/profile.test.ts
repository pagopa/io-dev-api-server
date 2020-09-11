import { NonEmptyString } from "italia-ts-commons/lib/strings";
import supertest from "supertest";
import { EmailAddress } from "../../../generated/definitions/backend/EmailAddress";
import { FiscalCode } from "../../../generated/definitions/backend/FiscalCode";
import { InitializedProfile } from "../../../generated/definitions/backend/InitializedProfile";
import { Profile } from "../../../generated/definitions/backend/Profile";
import { UserMetadata } from "../../../generated/definitions/backend/UserMetadata";
import { basePath } from "../../../generated/definitions/backend_api_paths";
import { Municipality } from "../../../generated/definitions/content/Municipality";
import { fiscalCode } from "../../global";
import { userMetadata } from "../../payloads/userMetadata";
import app from "../../server";

const request = supertest(app);

it("profile should return a valid profile", async (done) => {
  const response = await request.get(`${basePath}/profile`);
  expect(response.status).toBe(200);
  const profile = InitializedProfile.decode(response.body);
  expect(profile.isRight()).toBeTruthy();
  if (profile.isRight()) {
    expect(profile.value.fiscal_code).toBe(fiscalCode);
  }
  done();
});

it("profile should return a valid updated profile (version increased)", async (done) => {
  const profile: Profile = {
    is_inbox_enabled: true,
    is_email_enabled: true,
    is_webhook_enabled: true,
    email: "new_email@email.it" as EmailAddress,
    version: 5,
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

it("get user-metadata should return a valid user-metadata", async (done) => {
  const response = await request.get(`${basePath}/user-metadata`);
  expect(response.status).toBe(200);
  const usermetadata = UserMetadata.decode(response.body);
  expect(usermetadata.isRight()).toBeTruthy();
  done();
});

it("get municipality should return a valid municipality", async (done) => {
  const response = await request.get(
    `/static_contents/municipalities/A/B/CODE`
  );
  expect(response.status).toBe(200);
  const municipality = Municipality.decode(response.body);
  expect(municipality.isRight()).toBeTruthy();
  done();
});

it("post user-metadata should return the updated user-metadata", async (done) => {
  const response = await request
    .post(`${basePath}/user-metadata`)
    .send(userMetadata.payload)
    .set("Content-Type", "application/json");
  expect(response.status).toBe(200);
  const updatedUsermetadata = UserMetadata.decode(response.body);
  expect(updatedUsermetadata.isRight()).toBeTruthy();
  if (updatedUsermetadata.isRight()) {
    expect(updatedUsermetadata.value).toEqual(userMetadata.payload);
  }
  done();
});
