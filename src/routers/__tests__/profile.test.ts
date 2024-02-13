import * as E from "fp-ts/lib/Either";
import supertest from "supertest";
import { EmailAddress } from "../../../generated/definitions/backend/EmailAddress";
import { InitializedProfile } from "../../../generated/definitions/backend/InitializedProfile";
import { Profile } from "../../../generated/definitions/backend/Profile";
import { UserMetadata } from "../../../generated/definitions/backend/UserMetadata";
import { Municipality } from "../../../generated/definitions/content/Municipality";
import { ioDevServerConfig } from "../../config";
import { basePath } from "../../payloads/response";
import { mockUserMetadata } from "../../payloads/userMetadata";
import app from "../../server";

const request = supertest(app);

it("profile should return a valid profile", async () => {
  const response = await request.get(`${basePath}/profile`);
  expect(response.status).toBe(200);
  const profile = InitializedProfile.decode(response.body);
  expect(E.isRight(profile)).toBeTruthy();
  if (E.isRight(profile)) {
    expect(profile.right.fiscal_code).toBe(
      ioDevServerConfig.profile.attrs.fiscal_code
    );
  }
});

it("profile should return a valid updated profile (version increased)", async () => {
  const profile: Profile = {
    is_inbox_enabled: true,
    is_email_enabled: true,
    is_webhook_enabled: true,
    email: "new_email@email.it" as EmailAddress,
    version: 1
  };
  const response = await request
    .post(`${basePath}/profile`)
    .send(profile)
    .set("Content-Type", "application/json");

  expect(response.status).toBe(200);
  const updatedProfile = InitializedProfile.decode(response.body);
  if (E.isRight(updatedProfile)) {
    expect(updatedProfile.right.version).toBe(profile.version + 1);
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
    expect(updatedUsermetadata.right).toEqual(mockUserMetadata);
  }
});
