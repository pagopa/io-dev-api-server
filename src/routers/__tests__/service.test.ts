import supertest from "supertest";
import { ioDevServerConfig, staticContentRootPath } from "../../config";
import app from "../../server";
import ServicesDB from "../../features/services/persistence/servicesDatabase";

const request = supertest(app);

beforeAll(() => ServicesDB.createServices(ioDevServerConfig));

afterAll(() => ServicesDB.deleteServices());

it("static_contents should return a valid service logo", async () => {
  const response = await request.get(
    `${staticContentRootPath}/logos/services/service_id.png`
  );
  expect(response.status).toBe(200);
});

it("static_contents should return a valid organization logo", async () => {
  const response = await request.get(
    `${staticContentRootPath}/logos/organizations/organization_id.png`
  );
  expect(response.status).toBe(200);
});
