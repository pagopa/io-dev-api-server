import supertest from "supertest";
import app from "../../../../server";
import { addIdPayPrefix } from "../router";
import {
  checkPrerequisites,
  initiativeData,
  onboardingStatuses,
  prerequisitesErrors
} from "../../../../payloads/features/idpay/onboarding/data";
import {
  IDPayInitiativeID,
  IDPayServiceID
} from "../../../../payloads/features/idpay/onboarding/types";
import { OnboardingPutDTO } from "../../../../../generated/definitions/idpay/OnboardingPutDTO";
import { RequiredCriteriaDTO } from "../../../../../generated/definitions/idpay/RequiredCriteriaDTO";
import {
  initiativeIdToString,
  serviceIdToString
} from "../../../../payloads/features/idpay/onboarding/utils";

const request = supertest(app);

describe("IDPay Onboarding API", () => {
  describe("GET getInitiativeData", () => {
    it("should return 200 with Initiative data if service ID exists", async () => {
      const serviceId = IDPayServiceID.DEFAULT;
      const initiative = initiativeData[serviceId];

      const response = await request.get(
        addIdPayPrefix(`/onboarding/service/${serviceIdToString(serviceId)}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(initiative);
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
      const initiativeId = IDPayInitiativeID.INVITED;
      const status = onboardingStatuses[initiativeId];

      const response = await request.get(
        addIdPayPrefix(
          `/onboarding/${initiativeIdToString(initiativeId)}/status`
        )
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({ status });
    });

    it("should return 404 if initiative ID does not exist", async () => {
      const response = await request.get(
        addIdPayPrefix(`/onboarding/ABC/status`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("PUT onboardingCitizen", () => {
    it("should return 204 if initiative ID exists", async () => {
      const initiativeId = initiativeIdToString(IDPayInitiativeID.INVITED);

      const response = await request
        .put(addIdPayPrefix("/onboarding"))
        .send({ initiativeId });
      expect(response.status).toBe(204);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC";

      const response = await request
        .put(addIdPayPrefix("/onboarding"))
        .send({ initiativeId });
      expect(response.status).toBe(404);
    });
    it("should return 400 if request body is not correct", async () => {
      const response = await request
        .put(addIdPayPrefix("/onboarding"))
        .send({});
      expect(response.status).toBe(400);
    });
  });
  describe("PUT checkPrerequisites", () => {
    it("should return 200 with prerequisites if initiative ID exists and does not have errors", async () => {
      const initiativeId = initiativeIdToString(IDPayInitiativeID.DEFAULT);

      const prerequisites: RequiredCriteriaDTO =
        checkPrerequisites[IDPayInitiativeID.DEFAULT];

      const response = await request
        .put(addIdPayPrefix("/onboarding/initiative"))
        .send({ initiativeId });
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(prerequisites);
    });
    it("should return 202 if initiative does not have prerequisites", async () => {
      const initiativeId = initiativeIdToString(
        IDPayInitiativeID.NO_PREREQUISITES
      );

      const response = await request
        .put(addIdPayPrefix("/onboarding/initiative"))
        .send({ initiativeId });
      expect(response.status).toBe(202);
    });
    it("should return 403 if initiative has check error", async () => {
      const initiativeId = initiativeIdToString(
        IDPayInitiativeID.ERR_CHECK_BUDGET_TERMINATED
      );
      const error =
        prerequisitesErrors[IDPayInitiativeID.ERR_CHECK_BUDGET_TERMINATED];

      const response = await request
        .put(addIdPayPrefix("/onboarding/initiative"))
        .send({ initiativeId });
      expect(response.status).toBe(403);
      expect(response.body).toStrictEqual(error);
    });
    it("should return 400 if malformed request body", async () => {
      const response = await request
        .put(addIdPayPrefix("/onboarding/initiative"))
        .send({});
      expect(response.status).toBe(400);
    });
    it("should return 404 if initiative does not exist", async () => {
      const initiativeId = "ABC";

      const response = await request
        .put(addIdPayPrefix("/onboarding/initiative"))
        .send({ initiativeId });
      expect(response.status).toBe(404);
    });
  });
  describe("PUT consentOnboarding", () => {
    it("should return 202 if initiative ID exists", async () => {
      const initiativeId = initiativeIdToString(IDPayInitiativeID.INVITED);

      const response = await request
        .put(addIdPayPrefix("/onboarding/consent"))
        .send({ initiativeId });
      expect(response.status).toBe(202);
    });
    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC";

      const response = await request
        .put(addIdPayPrefix("/onboarding/consent"))
        .send({ initiativeId });
      expect(response.status).toBe(404);
    });
    it("should return 400 if request body is not correct", async () => {
      const response = await request
        .put(addIdPayPrefix("/onboarding/consent"))
        .send({});
      expect(response.status).toBe(400);
    });
  });
});
