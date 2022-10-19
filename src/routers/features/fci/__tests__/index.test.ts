import supertest from "supertest";
import {
  SIGNATURE_ID,
  SIGNATURE_REQUEST_ID
} from "../../../../payloads/features/fci/signature-request";
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
          addFciPrefix(`/signature-requests/t345yt345`)
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
  describe("GET signature detail view", () => {
    describe("when the signer request signature detail with a valid signatureId", () => {
      it("should return 200", async () => {
        const response = await request.get(
          addFciPrefix(`/signatures/${SIGNATURE_ID}`)
        );
        expect(response.status).toBe(200);
      });
    });
    describe("when the signer request signature detail with a not valid signatureId", () => {
      it("should return 400", async () => {
        const response = await request.get(
          addFciPrefix(`/signatures/345345645`)
        );
        expect(response.status).toBe(400);
      });
    });
  });
});
