import supertest from "supertest";
import { ulid } from "ulid";
import { createSignatureBody } from "../../../../payloads/features/fci/create-signature.body";
import { SIGNATURE_REQUEST_ID } from "../../../../payloads/features/fci/signature-request";
import app from "../../../../server";
import { addFciPrefix } from "../index";

const request = supertest(app);

describe("io-sign API", () => {
  describe("GET signature-request", () => {
    describe("when the signer request a signature-request with a valid signatureRequestId", () => {
      it("should return 200", async () => {
        const response = await request.get(
          addFciPrefix(`/signature-requests/${SIGNATURE_REQUEST_ID}`)
        );
        expect(response.status).toBe(200);
      });
    });
    describe("when the signer request a signature-request without signatureRequestId", () => {
      it("should return 400", async () => {
        const response = await request.get(
          addFciPrefix(`/signature-requests/${ulid()}`)
        );
        expect(response.status).toBe(400);
      });
    });
  });
  describe("GET qtsp clauses", () => {
    describe("when the signer request qtsp clauses", () => {
      it("should return 200 and the clauses list", async () => {
        const response = await request.get(addFciPrefix(`/qtsp/clauses`));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("clauses");
      });
    });
  });
  describe("POST create signature", () => {
    describe("when the signer request signature with a valid body", () => {
      it("should return 201", async () => {
        const response = await request
          .post(addFciPrefix(`/signatures`))
          .send(createSignatureBody);
        expect(response.status).toBe(201);
      });
    });
    describe("when the signer request signature detail with a not valid body", () => {
      it("should return 400", async () => {
        const response = await request.post(addFciPrefix(`/signatures`));
        expect(response.status).toBe(400);
      });
    });
  });
});
