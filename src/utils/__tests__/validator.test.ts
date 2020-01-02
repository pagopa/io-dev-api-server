import * as t from "io-ts";
import { EmailAddress } from "../../../generated/definitions/backend/EmailAddress";
import { validatePayload } from "../validator";

describe("suite to test validatePayload function", () => {
  it("test with io-ts codec", () => {
    const payload = 1;
    const codec = t.Integer;
    const result = validatePayload(codec, payload);
    expect(result).toBe(payload);
  });

  it("test with io-ts codec. an error should be thrown", () => {
    const payload = "abc";
    const codec = t.Integer;
    expect(() => validatePayload(codec, payload)).toThrowError();
  });

  it("test with io-backend codec codec (EmailAddress)", () => {
    const validEmail = "valid@email.com";
    const result = validatePayload(EmailAddress, validEmail);
    expect(result).toBe(validEmail);
  });

  it("test with io-backend codec codec (EmailAddress)", () => {
    const invalidEmail = "invalid@email@email.com";
    expect(() => validatePayload(EmailAddress, invalidEmail)).toThrowError();
  });
});
