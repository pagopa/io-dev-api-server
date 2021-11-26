import supertest from "supertest";
import { PaypalPspListResponse } from "../../../generated/definitions/pagopa/PaypalPspListResponse";
import app from "../../server";
import { appendWalletV3Prefix } from "../../utils/wallet";
const request = supertest(app);

it("should return a valid psp list", async done => {
  const response = await request.get(appendWalletV3Prefix("/paypal/psps"));
  const payPalPspList = PaypalPspListResponse.decode(response.body);
  expect(payPalPspList.isRight()).toBeTruthy();
  expect(response.status).toBe(200);
  done();
});
