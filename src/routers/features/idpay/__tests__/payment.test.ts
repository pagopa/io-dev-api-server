import supertest from "supertest";
import app from "../../../../server";
import { addIdPayPrefix } from "../router";

const request = supertest(app);

describe("IDPay Payment API", () => {
  describe("PUT putPreAuthPayment", () => {
    it("should return 200 with payment data", async () => {
      const trxCode = "00000001";

      const response = await request.put(
        addIdPayPrefix(`/payment/qr-code/${trxCode}/relate-user`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("trxCode", trxCode);
    });
    it("should return 404", async () => {
      const trxCode = "123456";

      const response = await request.get(
        addIdPayPrefix(`/payment/qr-code/${trxCode}/relate-user`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("PUT putAuthPayment", () => {
    it("should return 200 with payment data", async () => {
      const trxCode = "00000001";

      const response = await request.put(
        addIdPayPrefix(`/payment/qr-code/${trxCode}/authorize`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("trxCode", trxCode);
    });
    it("should return 404", async () => {
      const trxCode = "123456";

      const response = await request.get(
        addIdPayPrefix(`/payment/qr-code/${trxCode}/authorize`)
      );
      expect(response.status).toBe(404);
    });
  });
});
