import supertest, { Response } from "supertest";
import { WalletPaymentstatus } from "../../../generated/definitions/pagopa/WalletPaymentstatus";
import { Psp } from "../../../generated/definitions/pagopa/walletv2/Psp";
import { SessionResponse } from "../../../generated/definitions/pagopa/walletv2/SessionResponse";
import { TransactionListResponse } from "../../../generated/definitions/pagopa/walletv2/TransactionListResponse";
import { WalletListResponse } from "../../../generated/definitions/pagopa/walletv2/WalletListResponse";
import { WalletV2ListResponse } from "../../../generated/definitions/pagopa/walletv2/WalletV2ListResponse";
import { sessionToken } from "../../payloads/wallet";
import app from "../../server";
import {
  transactionPageSize,
  transactions,
  transactionsTotal,
  walletCount
} from "../wallet";

const request = supertest(app);
const walletPath = "/wallet/v1";
const appendWalletPrefix = (path: string) => `${walletPath}${path}`;
const walletV2Path = "/wallet/v2";
const appendWallet2Prefix = (path: string) => `${walletV2Path}${path}`;
const testGetWallets = (response: Response) => {
  expect(response.status).toBe(200);
  const wallets = WalletListResponse.decode(response.body);
  expect(wallets.isRight()).toBeTruthy();
  if (wallets.isRight() && wallets.value.data) {
    expect(wallets.value.data.length).toBe(walletCount);
  }
  return wallets.value;
};

it("/wallet should return a list of wallets (payments method instances)", async done => {
  const response = await request.get(appendWalletPrefix("/wallet"));
  testGetWallets(response);
  done();
});

it("should start a valid session", async done => {
  const response = await request.get(
    appendWalletPrefix("/users/actions/start-session")
  );
  expect(response.status).toBe(200);
  const session = SessionResponse.decode(response.body);
  expect(session.isRight()).toBeTruthy();
  if (session.isRight()) {
    expect(session.value).toEqual(sessionToken);
  }
  done();
});

it("should set a wallet as favourite", async done => {
  const responseWallets = await request.get(appendWallet2Prefix("/wallet"));
  const wallets: any = testGetWallets(responseWallets);
  const firstWallet = wallets.data[0];
  const response = await request.post(
    appendWalletPrefix(`/wallet/${firstWallet.idWallet}/actions/favourite`)
  );
  expect(response.status).toBe(200);
  done();
});

it("should set pagoPa to false", async done => {
  const responseWallets = await request.get(appendWallet2Prefix("/wallet"));
  const wallets: any = testGetWallets(responseWallets);
  const firstWallet = wallets.data[0];
  const response = await request
    .put(appendWalletPrefix(`/wallet/${firstWallet.idWallet}/payment-status`))
    .send({ pagoPA: false });
  expect(response.status).toBe(200);
  const responsePayload = WalletPaymentstatus.decode(response.body);
  expect(responsePayload.isRight()).toBeTruthy();
  if (responsePayload.isRight()) {
    expect(responsePayload.value).toEqual({ pagoPA: false });
  }
  // invert
  const responseInvert = await request
    .put(appendWalletPrefix(`/wallet/${firstWallet.idWallet}/payment-status`))
    .send({ pagoPA: true });
  expect(responseInvert.status).toBe(200);
  const responsePayloadInvert = WalletPaymentstatus.decode(responseInvert.body);
  expect(responsePayloadInvert.isRight()).toBeTruthy();
  if (responsePayloadInvert.isRight()) {
    expect(responsePayloadInvert.value).toEqual({ pagoPA: true });
  }
  done();
});

it("should fails to set a non existing wallet as favourite", async done => {
  const response = await request.post(
    appendWalletPrefix(`/wallet/-1234/actions/favourite`)
  );
  expect(response.status).toBe(404);
  done();
});

it("services should return a valid transactions list", async done => {
  const response = await request.get(appendWalletPrefix("/transactions"));
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
    appendWalletPrefix(`/transactions?start=${transactionsTotal - 1}`)
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
    appendWalletPrefix(`/transactions?start=${transactionsTotal + 1}`)
  );
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(list.isRight()).toBeTruthy();
  if (list.isRight() && list.value.data) {
    expect(list.value.data.length).toEqual(0);
  }
  done();
});

it("should return a valid psp", async done => {
  const response = await request.get(appendWalletPrefix(`/psps/43188`));
  expect(response.status).toBe(200);
  const psp = Psp.decode(response.body);
  expect(psp.isRight()).toBeTruthy();
  done();
});
