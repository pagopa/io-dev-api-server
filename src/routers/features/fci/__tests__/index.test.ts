import supertest from "supertest";
import { ulid } from "ulid";
import { createSignatureBody } from "../../../../payloads/features/fci/create-signature-body";
import { createFilledDocumentBody } from "../../../../payloads/features/fci/qtsp-filled-document";
import { SIGNATURE_REQUEST_ID } from "../../../../payloads/features/fci/signature-request";
import app from "../../../../server";
import { addFciPrefix } from "../index";
import { EnvironmentEnum } from "../../../../../generated/definitions/fci/Environment";

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
      it("should return a valid x-io-sign-environment header equal to test", async () => {
        const response = await request.get(
          addFciPrefix(`/signature-requests/${SIGNATURE_REQUEST_ID}`)
        );
        expect(response.status).toBe(200);
        expect(response.header["x-io-sign-environment"]).toBe(
          EnvironmentEnum.test
        );
      });
    });
    describe("when the signer request a signature-request without a valid signatureRequestId", () => {
      it("should return 404", async () => {
        const response = await request.get(
          addFciPrefix(`/signature-requests/${ulid()}`)
        );
        expect(response.status).toBe(404);
      });
      it("should return a valid x-io-sign-environment header equal to test", async () => {
        const response = await request.get(
          addFciPrefix(`/signature-requests/${ulid()}`)
        );
        expect(response.status).toBe(404);
        expect(response.header["x-io-sign-environment"]).toBe(
          EnvironmentEnum.test
        );
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
  describe("POST qtsp filled document", () => {
    describe("when the signer request qtsp filled document", () => {
      it("should return 201 and the filled_document_url", async () => {
        const response = await request
          .post(addFciPrefix(`/qtsp/clauses/filled_document`))
          .send(createFilledDocumentBody);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("filled_document_url");
      });
    });
  });
  describe("POST create signature", () => {
    describe("when the signer request a signature with a valid body", () => {
      it("should return 201", async () => {
        const response = await request
          .post(addFciPrefix(`/signatures`))
          .send(createSignatureBody);
        expect(response.status).toBe(200);
      });
    });
    describe("when the signer request signature detail with a not valid body", () => {
      it("should return 400", async () => {
        const response = await request.post(addFciPrefix(`/signatures`));
        expect(response.status).toBe(400);
      });
    });
  });
  describe("GET fci metadata", () => {
    describe("when the signer request metadata", () => {
      it("should return 200 and the fci metadata", async () => {
        const response = await request.get(addFciPrefix(`/metadata`));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("serviceId");
      });
    });
  });
  describe("GET signature-requests list", () => {
    describe("when the signer-requests called", () => {
      it("should return 200 and the signature requests array", async () => {
        const response = await request.get(addFciPrefix(`/signature-requests`));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("items");
        expect(response.body.items).toBeInstanceOf(Array);
      });
    });
  });
});
