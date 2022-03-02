import * as E from "fp-ts/lib/Either";

import { PaypalPspListResponse } from "../../../generated/definitions/pagopa/PaypalPspListResponse";

import { appendWalletV3Prefix } from "../../utils/wallet";

import supertest, { SuperTest, Test } from "supertest";

import { createIODevelopmentServer } from "../../server";

// tslint:disable-next-line:no-let
let request: SuperTest<Test>;

beforeAll(async () => {
  const ioDevelopmentServer = createIODevelopmentServer();
  const app = await ioDevelopmentServer.toExpressInstance();
  request = supertest(app);
});

it("should return a valid psp list", async () => {
  const response = await request.get(appendWalletV3Prefix("/paypal/psps"));
  const payPalPspList = PaypalPspListResponse.decode(response.body);
  expect(response.status).toBe(200);
  if (response.status === 200) {
    expect(E.isRight(payPalPspList)).toBeTruthy();
  }
});
