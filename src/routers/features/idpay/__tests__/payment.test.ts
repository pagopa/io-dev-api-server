import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "../../../../server";
import { addIdPayPrefix } from "../router";
import { codeToFailure } from "../payment";

const request = supertest(app);

describe("IDPay Payment API", () => {
  describe("PUT putPreAuthPayment", () => {
    it("should return 200 with payment data", async () => {
      const trxCode = faker.random.alphaNumeric(8, { bannedChars: "1234567" });

      const response = await request.put(
        addIdPayPrefix(`/payment/qr-code/${trxCode}/relate-user`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("trxCode");
    });
    Object.keys(codeToFailure).forEach(key => {
      const { status, code } = codeToFailure[parseInt(key, 10)];
      it(`should return ${status} with ${code}`, async () => {
        const trxCode = `${faker.random.alphaNumeric(
          6
        )}${key}${faker.random.alphaNumeric(1)}`;

        const response = await request.put(
          addIdPayPrefix(`/payment/qr-code/${trxCode}/relate-user`)
        );

        expect(response.status).toBe(status);
        expect(response.body).toHaveProperty("code", code);
      });
    });
  });
  describe("PUT putAuthPayment", () => {
    it("should return 200 with payment data", async () => {
      const trxCode = faker.random.alphaNumeric(8, { bannedChars: "1234567" });

      const response = await request.put(
        addIdPayPrefix(`/payment/qr-code/${trxCode}/authorize`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("trxCode");
    });
    Object.keys(codeToFailure).forEach(key => {
      const { status, code } = codeToFailure[parseInt(key, 10)];
      it(`should return ${status} with ${code}`, async () => {
        const trxCode = `${faker.random.alphaNumeric(7)}${key}`;

        const response = await request.put(
          addIdPayPrefix(`/payment/qr-code/${trxCode}/authorize`)
        );

        expect(response.status).toBe(status);
        expect(response.body).toHaveProperty("code", code);
      });
    });
  });
  describe("DELETE deletePayment", () => {
    it("should return 200", async () => {
      const trxCode = faker.random.alphaNumeric(8, { bannedChars: "1234567" });

      const response = await request.delete(
        addIdPayPrefix(`/payment/qr-code/${trxCode}`)
      );
      expect(response.status).toBe(200);
    });
    Object.keys(codeToFailure).forEach(key => {
      const { status, code } = codeToFailure[parseInt(key, 10)];
      it(`should return ${status} with ${code}`, async () => {
        const trxCode = `${faker.random.alphaNumeric(7)}${key}`;

        const response = await request.delete(
          addIdPayPrefix(`/payment/qr-code/${trxCode}`)
        );

        expect(response.status).toBe(status);
        expect(response.body).toHaveProperty("code", code);
      });
    });
  });
});
