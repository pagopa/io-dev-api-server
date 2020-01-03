import { NonEmptyString } from "italia-ts-commons/lib/strings";
import supertest from "supertest";
import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";
import { FiscalCode } from "../../generated/definitions/backend/FiscalCode";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { UserMetadata } from "../../generated/definitions/backend/UserMetadata";
import { UserProfile } from "../../generated/definitions/backend/UserProfile";
import { basePath } from "../../generated/definitions/backend_api_paths";
import app, { fiscalCode } from "../server";
const request = supertest(app);

it("profile should return a valid profile", async done => {
  const response = await request.get(`${basePath}/profile`);
  expect(response.status).toBe(200);
  const profile = UserProfile.decode(response.body);
  expect(profile.isRight()).toBeTruthy();
  if (profile.isRight()) {
    expect(profile.value.fiscal_code).toBe(fiscalCode);
  }
  done();
});

it("profile should return a valid updated profile (version increased)", async done => {
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

it("user-metadata should return a valid user-metadata", async done => {
  const response = await request.get(`${basePath}/user-metadata`);
  expect(response.status).toBe(200);
  const usermetadata = UserMetadata.decode(response.body);
  expect(usermetadata.isRight()).toBeTruthy();
  done();
});
