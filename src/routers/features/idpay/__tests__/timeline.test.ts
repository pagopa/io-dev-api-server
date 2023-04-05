import supertest from "supertest";
import { ibanList } from "../../../../payloads/features/idpay/iban/data";
import { getIbanListResponse } from "../../../../payloads/features/idpay/iban/get-iban-list";
import app from "../../../../server";
import { addIdPayPrefix } from "../router";
import { IDPayInitiativeID } from "../../../../payloads/features/idpay/types";
import { initiativeIdToString } from "../../../../payloads/features/idpay/utils";
import { operationList } from "../../../../payloads/features/idpay/timeline/data";

const request = supertest(app);

describe("IDPay Timeline API", () => {
  describe("GET getTimeline", () => {
    it("should return 200 with timeline list", async () => {
      const initiativeId = initiativeIdToString(IDPayInitiativeID.CONFIGURED);

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("operationList");
    });
    it("should return 200 with correct pagination info", async () => {
      const initiativeId = initiativeIdToString(IDPayInitiativeID.CONFIGURED);
      const operationSize = operationList.length;

      const page = 1;
      const size = 4;

      const totalPages = Math.ceil(operationSize / size);

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}?page=${page}&size=${size}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("operationList");
      expect(response.body).toHaveProperty("pageNo", page);
      expect(response.body).toHaveProperty("pageSize", size);
      expect(response.body).toHaveProperty("totalPages", totalPages);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("GET getTimelineDetail", () => {
    it("should return 200 with operation details", async () => {
      const initiativeId = initiativeIdToString(IDPayInitiativeID.CONFIGURED);
      const operationId = operationList[0].operationId;

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}/${operationId}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("operationId", operationId);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";
      const operationId = operationList[0].operationId;

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}/${operationId}`)
      );
      expect(response.status).toBe(404);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = initiativeIdToString(IDPayInitiativeID.CONFIGURED);
      const operationId = "ABC123";

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}/${operationId}`)
      );
      expect(response.status).toBe(404);
    });
  });
});
