import supertest from "supertest";
import app from "../server";
const request = supertest(app);

it("gets the test endpoint", async done => {
  const response = await request.get("/ping");

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("ok");
  done();
});
