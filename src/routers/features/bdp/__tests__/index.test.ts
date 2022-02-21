import * as E from "fp-ts/lib/Either";

import { CitizenOptInStatusEnum } from "../../../../../generated/definitions/bpd/citizen-v2/CitizenOptInStatus";
import { CitizenResource } from "../../../../../generated/definitions/bpd/citizen-v2/CitizenResource";

import { addBPDPrefix } from "../index";

import supertest, { SuperTest, Test } from "supertest";
import { createIODevelopmentServer } from "../../../../server";

let request: SuperTest<Test>;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressApplication();
  request = supertest(app);
});


describe("citizen V2 API", () => {
  describe("GET", () => {
    describe("when the citizen is not enrolled", () => {
      it("Should return 404", async () => {
        const response = await request.get(addBPDPrefix(`/io/citizen/v2`));
        expect(response.status).toBe(404);
      });
    });
  });

  describe("PUT", () => {
    describe("when the citizen is not enrolled", () => {
      it("Should return a 400, on update optInStatus", async () => {
        const response = await request
          .put(addBPDPrefix(`/io/citizen/v2`))
          .set("Content-type", "application/json")
          .send({ optInStatus: CitizenOptInStatusEnum.ACCEPTED });
        expect(response.status).toBe(400);
      });
    });
  });

  describe("when the citizen is enrolled", () => {
    it("GET Should return a 200", async () => {
      await request.put(addBPDPrefix(`/io/citizen/v2`));
      const response = await request.get(addBPDPrefix(`/io/citizen/v2`));
      expect(response.status).toBe(200);
      const cr = CitizenResource.decode(response.body);
      expect(E.isRight(cr)).toBeTruthy();
    });

    it("PUT Should return a 200", async () => {
      const response = await request.put(addBPDPrefix(`/io/citizen/v2`));
      expect(response.status).toBe(200);
      const cr = CitizenResource.decode(response.body);
      expect(E.isRight(cr)).toBeTruthy();
      if (E.isRight(cr)) {
        expect(cr.value.enabled === true).toBeTruthy();
      }
    });
    it("PUT Should return a 200 with optInStatus update", async () => {
      const response = await request
        .put(addBPDPrefix(`/io/citizen/v2`))
        .set("Content-type", "application/json")
        .send({ optInStatus: CitizenOptInStatusEnum.ACCEPTED });
      expect(response.status).toBe(200);
      const cr = CitizenResource.decode(response.body);
      expect(E.isRight(cr)).toBeTruthy();
      if (E.isRight(cr)) {
        expect(cr.value.enabled === true).toBeTruthy();
        expect(
          cr.value.optInStatus === CitizenOptInStatusEnum.ACCEPTED
        ).toBeTruthy();
      }
    });
  });
});
