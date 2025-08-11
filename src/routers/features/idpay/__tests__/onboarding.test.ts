import supertest from "supertest";
import { StatusEnum as InitiativeStatusEnum } from "../../../../../generated/definitions/idpay/OnboardingStatusDTO";
import {
  IDPayInitiativeID,
  IDPayServiceID
} from "../../../../payloads/features/idpay/types";
import {
  initiativeIdToString,
  serviceIdToString
} from "../../../../payloads/features/idpay/utils";
import app from "../../../../server";
import { addIdPayPrefix } from "../router";

const request = supertest(app);

describe("IDPay Onboarding API", () => {
  describe("GET getInitiativeData", () => {
    it("should return 200 with Initiative data if service ID exists", async () => {
      const serviceId = IDPayServiceID.OK;

      const response = await request.get(
        addIdPayPrefix(`/onboarding/service/${serviceIdToString(serviceId)}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "initiativeId",
        initiativeIdToString(IDPayInitiativeID.OK)
      );
    });

    it("should return 404 if service ID does not exist", async () => {
      const response = await request.get(
        addIdPayPrefix(`/onboarding/service/ABC`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("GET onboardingStatus", () => {
    it("should return 200 with status if initiativeId exists", async () => {
      const initiativeId = IDPayInitiativeID.OK_INVITED;

      const response = await request.get(
        addIdPayPrefix(
          `/onboarding/${initiativeIdToString(initiativeId)}/status`
        )
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "status",
        InitiativeStatusEnum.INVITED
      );
    });
    it("should return 404 if initiative status does not exists", async () => {
      const initiativeId = IDPayInitiativeID.OK;

      const response = await request.get(
        addIdPayPrefix(
          `/onboarding/${initiativeIdToString(initiativeId)}/status`
        )
      );
      expect(response.status).toBe(404);
    });
    it("should return 404 if initiative ID is not in the list", async () => {
      const response = await request.get(
        addIdPayPrefix(
          `/onboarding/${initiativeIdToString(IDPayInitiativeID.OK)}/status`
        )
      );
      expect(response.status).toBe(404);
    });
  });
  describe("PUT onboardingCitizen", () => {
    it("should return 204 if initiative ID exists", async () => {
      const initiativeId = initiativeIdToString(IDPayInitiativeID.OK_INVITED);

      const response = await request
        .put(addIdPayPrefix("/onboarding")) // eslint-disable-line sonarjs/no-duplicate-string
        .send({ initiativeId });
      expect(response.status).toBe(204);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC";

      const response = await request
        .put(addIdPayPrefix("/onboarding")) // eslint-disable-line sonarjs/no-duplicate-string
        .send({ initiativeId });
      expect(response.status).toBe(404);
    });
    it("should return 400 if request body is not correct", async () => {
      const response = await request
        .put(addIdPayPrefix("/onboarding")) // eslint-disable-line sonarjs/no-duplicate-string
        .send({});
      expect(response.status).toBe(400);
    });
  });
});
