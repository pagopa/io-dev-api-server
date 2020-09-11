import supertest from "supertest";
import { TransactionListResponse } from "../../../generated/definitions/pagopa/TransactionListResponse";
import app from "../../server";
import {
  transactionPageSize,
  transactions,
  transactionsTotal
} from "../wallet";
const request = supertest(app);

it("services should return a valid transactions list", async done => {
  const response = await request.get("/wallet/v1/transactions");
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(list.isRight()).toBeTruthy();
  if (list.isRight()) {
    expect(list.value.data).toEqual(transactions.slice(0, transactionPageSize));
    if (list.value.data) {
      expect(list.value.data.length).toEqual(
        Math.min(transactionPageSize, transactions.length)
      );
    }
  }
  done();
});

it("services should return a valid transactions list slice", async done => {
  const response = await request.get(
    `/wallet/v1/transactions?start=${transactionsTotal - 1}`
  );
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(list.isRight()).toBeTruthy();
  if (list.isRight() && list.value.data) {
    expect(list.value.data.length).toEqual(1);
  }
  done();
});

it("services should return an empty data transactions", async done => {
  const response = await request.get(
    `/wallet/v1/transactions?start=${transactionsTotal + 1}`
  );
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(list.isRight()).toBeTruthy();
  if (list.isRight() && list.value.data) {
    expect(list.value.data.length).toEqual(0);
  }
  done();
});
