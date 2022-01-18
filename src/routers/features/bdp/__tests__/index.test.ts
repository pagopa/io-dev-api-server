import * as E from "fp-ts/lib/Either";
import supertest from "supertest";
import { CitizenResource } from "../../../../../generated/definitions/bpd/citizen-v2/CitizenResource";
import app from "../../../../server";
import { addBPDPrefix } from "../index";

const request = supertest(app);

describe("citizen V2 API", () => {
  it("Should return 404, if is a GET request and currentCitizenV2 is undefined", async () => {
    const response = await request.get(addBPDPrefix(`/io/citizen/v2`));
    expect(response.status).toBe(404);
  });
  it("Should return a 200, CitizenResource (V2) if is a GET and currentCitizenV2 is not undefined", async () => {
    await request.put(addBPDPrefix(`/io/citizen/v2`));
    const response = await request.get(addBPDPrefix(`/io/citizen/v2`));
    expect(response.status).toBe(200);
    const cr = CitizenResource.decode(response.body);
    expect(E.isRight(cr)).toBeTruthy();
  });
  it("Should return a 200, CitizenResource (V2) with enabled = true if is a PUT", async () => {
    const response = await request.put(addBPDPrefix(`/io/citizen/v2`));
    expect(response.status).toBe(200);
    const cr = CitizenResource.decode(response.body);
    expect(E.isRight(cr)).toBeTruthy();
    if (E.isRight(cr)) {
      expect(cr.value.enabled === true).toBeTruthy();
    }
  });
});
