import * as t from "io-ts";
import { EmailAddress } from "../../../generated/definitions/backend/EmailAddress";
import {
  toPayload,
  validateAndCreatePayload,
  validatePayload
} from "../validator";

describe("suite to test validatePayload function", () => {
  it("test with io-ts codec", () => {
    const payload = 1;
    const result = validatePayload(t.Int, payload);
    expect(result).toBe(payload);
  });

  it("test with io-ts codec. an error should be thrown", () => {
    const payload = "abc";
    expect(() => validatePayload(t.Int, payload)).toThrowError();
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

  it("test with validateAndCreatePayload with valid email", () => {
    const validEmail = "valid@email.com";
    const res = validateAndCreatePayload(EmailAddress, validEmail);
    expect(res.payload).toBe(validEmail);
    expect(res.status).toBe(200);
  });

  it("test validateAndCreatePayload with invalid email", () => {
    const invalidEmail = "invalid@email@email.com";
    expect(() =>
      validateAndCreatePayload(EmailAddress, invalidEmail)
    ).toThrowError();
  });

  it("test toPayload with json data", () => {
    const payloadObject = { a: "test" };
    const p = toPayload(payloadObject);
    expect(p.status).toBe(200);
    expect(p.payload).toBe(payloadObject);
  });
});
