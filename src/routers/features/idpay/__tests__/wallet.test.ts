import { fakerIT as faker } from "@faker-js/faker";
import supertest from "supertest";
import { IbanPutDTO } from "../../../../../generated/definitions/idpay/IbanPutDTO";

import {
  generateIdPayCode,
  initiatives as idPayInitiatives,
  instruments as idPayInstruments
} from "../../../../persistence/idpay";
import app from "../../../../server";
import { getWalletV2 } from "../../../walletsV2";
import { addIdPayPrefix } from "../router";
import ServicesDB from "../../../../features/services/persistence/servicesDatabase";
import { ioDevServerConfig } from "../../../../config";

const request = supertest(app);

const initiatives = Object.values(idPayInitiatives);

// eslint-disable-next-line max-lines-per-function
describe("IDPay Wallet API", () => {
  beforeAll(() => {
    ServicesDB.createServices(ioDevServerConfig);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET getWallet", () => {
    it("should return 200 with the citizen's initiatives", async () => {
      const response = await request.get(addIdPayPrefix("/wallet"));
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("initiativeList");
    });
  });
  describe("GET getWalletDetail", () => {
    it("should return 200 with the initiative details", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", tInitiative.status);
    });
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 404 if initiative ID does not exist", async () => {
      const response = await request.get(addIdPayPrefix(`/wallet/ABC123`));
      expect(response.status).toBe(404);
    });
  });
  describe("GET getInitiativeBeneficiaryDetail", () => {
    it("should return 200 with the beneficiary details", async () => {
      const initiativeId = initiatives[0].initiativeId;
      const details = initiatives[0];

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/detail`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "initiativeName",
        details.initiativeName
      );
    });
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "A";

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/details`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("GET getWalletStatus", () => {
    it("should return 200 with the initiative status", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/status`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ status: tInitiative.status });
    });
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/status`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("PUT enrollIban", () => {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 200", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const body: IbanPutDTO = {
        description: "A",
        iban: faker.finance.iban({
          formatted: false,
          countryCode: "IT"
        })
      };

      const response = await request
        .put(addIdPayPrefix(`/wallet/${initiativeId}/iban`))
        .send(body);
      expect(response.status).toBe(200);
    });
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";
      const body: IbanPutDTO = {
        description: "A",
        iban: faker.finance.iban({
          formatted: false,
          countryCode: "IT"
        })
      };

      const response = await request
        .put(addIdPayPrefix(`/wallet/${initiativeId}/iban`))
        .send(body);
      expect(response.status).toBe(404);
    });
    it("should return 403 if invalid IBAN", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const body: IbanPutDTO = { description: "A", iban: "123" };

      const response = await request
        .put(addIdPayPrefix(`/wallet/${initiativeId}/iban`))
        .send(body);
      expect(response.status).toBe(403);
    });
    it("should return 400 if request body is malformed", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const response = await request
        .put(addIdPayPrefix(`/wallet/${initiativeId}/iban`))
        .send({});
      expect(response.status).toBe(400);
    });
  });
  describe("GET getInstrumentList", () => {
    it("should return 200 with the instruments list", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("instrumentList");
    });
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";

      const response = await request.get(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("PUT enrollInstrument", () => {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 200", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const walletId = getWalletV2()[1].idWallet;

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${walletId}`)
      );
      expect(response.status).toBe(200);
    });
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";
      const walletId = 2;

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${walletId}`)
      );
      expect(response.status).toBe(404);
    });
    it("should return 404 if wallet ID does not exist", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const walletId = 9999;

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${walletId}`)
      );
      expect(response.status).toBe(404);
    });
    it("should return 403 if instrument cannot be enrolled", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const walletId = 2;

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${walletId}`)
      );
      expect(response.status).toBe(403);
    });
  });
  describe("DELETE deleteInstrument", () => {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 200", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const instrumentId = idPayInstruments[initiativeId][0].instrumentId;

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${instrumentId}`)
      );
      expect(response.status).toBe(200);
    });
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";
      const instrumentId = "ABC";

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/instruments/${instrumentId}`)
      );
      expect(response.status).toBe(404);
    });
    it("should return 403 if instrument cannot be enrolled", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const instrumentId = idPayInstruments[initiativeId][0].instrumentId;

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
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 204", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/unsubscribe`)
      );
      expect(response.status).toBe(204);
    });
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";

      const response = await request.delete(
        addIdPayPrefix(`/wallet/${initiativeId}/unsubscribe`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("GET getIdpayCodeStatus", () => {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 200", async () => {
      const response = await request.get(addIdPayPrefix(`/wallet/code/status`));
      expect(response.status).toBe(200);
    });
  });
  describe("POST generateCode", () => {
    it("should return 200", async () => {
      const response = await request.post(
        addIdPayPrefix(`/wallet/code/generate`)
      );
      expect(response.status).toBe(200);
    });
    it("should return 200 when passing an initiativeId", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;

      const response = await request
        .post(addIdPayPrefix(`/wallet/code/generate`))
        .send({ initiativeId });
      expect(response.status).toBe(200);
    });
    it("should return 404 when passing an initiativeId that does not exists", async () => {
      const initiativeId = "ABC123";

      const response = await request
        .post(addIdPayPrefix(`/wallet/code/generate`))
        .send({ initiativeId });
      expect(response.status).toBe(404);
    });
  });
  describe("PUT enrollInstrumentCode", () => {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 200", async () => {
      const tInitiative = initiatives[1];
      const initiativeId = tInitiative.initiativeId;

      generateIdPayCode();

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/code/instruments`)
      );
      expect(response.status).toBe(200);
    });
    // eslint-disable-next-line sonarjs/no-duplicate-string
    it("should return 404", async () => {
      const initiativeId = "ABC123";

      const response = await request.put(
        addIdPayPrefix(`/wallet/${initiativeId}/code/instruments`)
      );
      expect(response.status).toBe(404);
    });
  });
});
