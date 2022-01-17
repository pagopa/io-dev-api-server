import * as E from "fp-ts/lib/Either";
import supertest from "supertest";
import { PaypalPspListResponse } from "../../../generated/definitions/pagopa/PaypalPspListResponse";
import app from "../../server";
import { appendWalletV3Prefix } from "../../utils/wallet";

const request = supertest(app);

it("should return a valid psp list", async () => {
  const response = await request.get(appendWalletV3Prefix("/paypal/psps"));
  const payPalPspList = PaypalPspListResponse.decode(response.body);
  expect(response.status).toBe(200);
  if (response.status === 200) {
    expect(E.isRight(payPalPspList)).toBeTruthy();
  }
});
