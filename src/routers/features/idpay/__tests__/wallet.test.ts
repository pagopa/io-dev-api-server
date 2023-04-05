import supertest from "supertest";
import { IDPayInitiativeID as InitiativeID } from "../../../../payloads/features/idpay/types";
import { initiativeIdToString } from "../../../../payloads/features/idpay/utils";
import {
  initiativeDetailsList,
  initiativeList,
  instrumentList
} from "../../../../payloads/features/idpay/wallet/data";
import app from "../../../../server";
import { addIdPayPrefix } from "../router";
import { IbanPutDTO } from "../../../../../generated/definitions/idpay/IbanPutDTO";

const request = supertest(app);

describe("IDPay Wallet API", () => {
  describe("GET getWallet", () => {
    it("should return 200 with the citizen's initiatives", async () => {
      const response = await request.get(addIdPayPrefix("/wallet"));
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("initiativeList");
    });
  });
  describe("GET getWalletDetail", () => {
    it("should return 200 with the initiative details", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.CONFIGURED);
      const details = initiativeList[InitiativeID.CONFIGURED];

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", details.status);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const response = await request.get(addIdPayPrefix(`/wallet/ABC123`));
      expect(response.status).toBe(404);
    });
  });
  describe("GET getInitiativeBeneficiaryDetail", () => {
    it("should return 200 with the beneficiary details", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.CONFIGURED);
      const details = initiativeDetailsList[InitiativeID.CONFIGURED];

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/detail`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "initiativeName",
        details.initiativeName
      );
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/details`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("GET getWalletStatus", () => {
    it("should return 200 with the initiative status", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.CONFIGURED);
      const status = initiativeList[InitiativeID.CONFIGURED].status;

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/status`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ status });
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/status`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("PUT enrollIban", () => {
    it("should return 200", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.CONFIGURED);
      const body: IbanPutDTO = { description: "A", iban: "123" };

      const response = await request
        .put(addIdPayPrefix(`/wallet/${initiativeId}/iban`))
        .send(body);
      expect(response.status).toBe(200);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";
      const body: IbanPutDTO = { description: "A", iban: "123" };

      const response = await request
        .put(addIdPayPrefix(`/wallet/${initiativeId}/iban`))
        .send(body);
      expect(response.status).toBe(404);
    });
    it("should return 400 if request body is malformed", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.CONFIGURED);
      const response = await request
        .put(addIdPayPrefix(`/wallet/${initiativeId}/iban`))
        .send({});
      expect(response.status).toBe(400);
    });
  });
  describe("GET getInstrumentList", () => {
    it("should return 200 with the instruments list", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.CONFIGURED);

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("instrumentList");
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("PUT enrollInstrument", () => {
    it("should return 200", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.NOT_CONFIGURED);
      const walletId = 2;

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${walletId}`)
      );
      expect(response.status).toBe(200);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";
      const walletId = 2;

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${walletId}`)
      );
      expect(response.status).toBe(404);
    });
    it("should return 404 if wallet ID does not exist", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.NOT_CONFIGURED);
      const walletId = 9999;

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${walletId}`)
      );
      expect(response.status).toBe(404);
    });
    it("should return 403 if instrument cannot be enrolled", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.CONFIGURED);
      const walletId = 2;

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${walletId}`)
      );
      expect(response.status).toBe(403);
    });
  });
  describe("DELETE deleteInstrument", () => {
    it("should return 200", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.CONFIGURED);
      const instrumentId =
        instrumentList[InitiativeID.CONFIGURED][0].instrumentId;

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${instrumentId}`)
      );
      expect(response.status).toBe(200);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";
      const instrumentId =
        instrumentList[InitiativeID.CONFIGURED][0].instrumentId;

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${instrumentId}`)
      );
      expect(response.status).toBe(404);
    });
    it("should return 403 if instrument cannot be enrolled", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.NOT_CONFIGURED);
      const instrumentId =
        instrumentList[InitiativeID.CONFIGURED][0].instrumentId;

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${instrumentId}`)
      );
      expect(response.status).toBe(403);
    });
  });
  describe("GET getInitiativesWithInstrument", () => {
    it("should return 200 with the initiative list", async () => {
      const walletId = 2;

      const response = await request.get(
        addIdPayPrefix(`/wallet/instrument/${walletId}/initiatives`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("maskedPan");
    });
    it("should return 404 if wallet ID does not exist", async () => {
      const walletId = 9999;

      const response = await request.get(
        addIdPayPrefix(`/wallet/instrument/${walletId}/initiatives`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("DELETE unsubscribe", () => {
    it("should return 200", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.CONFIGURED);

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/unsubscribe`)
      );
      expect(response.status).toBe(200);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/unsubscribe`)
      );
      expect(response.status).toBe(404);
    });
    it("should return 403 if initiative could not be unsubscribed", async () => {
      const initiativeId = initiativeIdToString(InitiativeID.UNSUBSCRIBED);

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/unsubscribe`)
      );
      expect(response.status).toBe(403);
    });
  });
});