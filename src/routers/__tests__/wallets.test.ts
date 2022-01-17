import * as E from "fp-ts/lib/Either";
import supertest, { Response } from "supertest";
import { DeletedWalletsResponse } from "../../../generated/definitions/pagopa/DeletedWalletsResponse";
import { EnableableFunctionsEnum } from "../../../generated/definitions/pagopa/EnableableFunctions";
import { PspDataListResponse } from "../../../generated/definitions/pagopa/PspDataListResponse";
import { Psp } from "../../../generated/definitions/pagopa/walletv2/Psp";
import { SessionResponse } from "../../../generated/definitions/pagopa/walletv2/SessionResponse";
import { TransactionListResponse } from "../../../generated/definitions/pagopa/walletv2/TransactionListResponse";
import { WalletListResponse } from "../../../generated/definitions/pagopa/walletv2/WalletListResponse";
import { sessionToken } from "../../payloads/wallet";
import app from "../../server";
import { PatchedWalletV2 } from "../../types/PatchedWalletV2";
import { PatchedWalletV2ListResponse } from "../../types/PatchedWalletV2ListResponse";
import { PatchedWalletV2Response } from "../../types/PatchedWalletV2Response";
import { appendWalletV1Prefix, appendWalletV2Prefix } from "../../utils/wallet";
import {
  transactionPageSize,
  transactions,
  transactionsTotal,
  walletCount
} from "../wallet";

const request = supertest(app);
const testGetWallets = (response: Response) => {
  expect(response.status).toBe(200);
  const wallets = WalletListResponse.decode(response.body);
  expect(E.isRight(wallets)).toBeTruthy();
  if (E.isRight(wallets) && wallets.value.data) {
    expect(wallets.value.data.length).toBe(walletCount);
  }
  return wallets.value;
};

const testGetWalletsV2 = (
  response: Response
): ReadonlyArray<PatchedWalletV2> => {
  expect(response.status).toBe(200);
  const wallets = PatchedWalletV2ListResponse.decode(response.body);
  expect(E.isRight(wallets)).toBeTruthy();
  if (E.isRight(wallets) && wallets.value.data) {
    expect(wallets.value.data.length ?? 0).toBe(walletCount);
    return wallets.value.data;
  }
  return [];
};

it("/wallet should return a list of wallets (payments method instances)", async () => {
  const response = await request.get(appendWalletV1Prefix("/wallet"));
  testGetWallets(response);
});

it("should start a valid session", async () => {
  const response = await request.get(
    appendWalletV1Prefix("/users/actions/start-session")
  );
  expect(response.status).toBe(200);
  const session = SessionResponse.decode(response.body);
  expect(E.isRight(session)).toBeTruthy();
  if (E.isRight(session)) {
    expect(session.value).toEqual(sessionToken);
  }
});

it("should set a wallet as favourite", async () => {
  const responseWallets = await request.get(appendWalletV2Prefix("/wallet"));
  const wallets = testGetWalletsV2(responseWallets);
  const firstWallet = wallets[0];
  const response = await request.post(
    appendWalletV1Prefix(`/wallet/${firstWallet.idWallet}/actions/favourite`)
  );
  expect(response.status).toBe(200);
});

it("should set pagoPa flag to false (if credit card > 1)", async () => {
  const responseWallets = await request.get(appendWalletV2Prefix("/wallet"));
  const wallets = testGetWalletsV2(responseWallets);
  const firstWallet = wallets.find(w =>
    (w.enableableFunctions ?? []).some(
      ef => ef === EnableableFunctionsEnum.pagoPA
    )
  );
  // wallet should include at least 1 credit card (check global/config)
  expect(firstWallet).toBeDefined();
  const response = await request
    .put(
      appendWalletV2Prefix(`/wallet/${firstWallet!.idWallet}/payment-status`)
    )
    .send({ data: { pagoPA: false } });
  expect(response.status).toBe(200);
  const responsePayload = PatchedWalletV2Response.decode(response.body);
  expect(E.isRight(responsePayload)).toBeTruthy();
  if (E.isRight(responsePayload)) {
    expect(responsePayload.value).toEqual({
      data: { ...firstWallet, favourite: false, pagoPA: false }
    });
  }
  // invert
  const responseInvert = await request
    .put(
      appendWalletV2Prefix(`/wallet/${firstWallet!.idWallet}/payment-status`)
    )
    .send({ data: { pagoPA: true } });
  expect(responseInvert.status).toBe(200);
  const responsePayloadInvert = PatchedWalletV2Response.decode(
    responseInvert.body
  );
  expect(E.isRight(responsePayloadInvert)).toBeTruthy();
  if (E.isRight(responsePayloadInvert)) {
    expect(responsePayloadInvert.value).toEqual({
      data: { ...firstWallet, favourite: false, pagoPA: true }
    });
  }
});

it("should remove in bulk all these methods that have a specific function enabled", async () => {
  const responseWallets = await request.get(appendWalletV2Prefix("/wallet"));
  const wallets = testGetWalletsV2(responseWallets);
  const pagopaWallets = wallets.filter(w =>
    (w.enableableFunctions ?? []).includes(EnableableFunctionsEnum.pagoPA)
  );
  const bpdWallets = wallets.filter(w =>
    (w.enableableFunctions ?? []).includes(EnableableFunctionsEnum.BPD)
  );
  const faWallets = wallets.filter(w =>
    (w.enableableFunctions ?? []).includes(EnableableFunctionsEnum.FA)
  );
  const response = await request.delete(
    appendWalletV2Prefix(
      `/wallet/delete-wallets?service=${EnableableFunctionsEnum.pagoPA}`
    )
  );
  const responseBpd = await request.delete(
    appendWalletV2Prefix(
      `/wallet/delete-wallets?service=${EnableableFunctionsEnum.BPD}`
    )
  );
  const responseFa = await request.delete(
    appendWalletV2Prefix(
      `/wallet/delete-wallets?service=${EnableableFunctionsEnum.FA}`
    )
  );
  const testResponse = (toBeDeleted: number, res: typeof response) => {
    expect(res.status).toBe(200);
    const deleteResponse = DeletedWalletsResponse.decode(res.body);
    expect(E.isRight(deleteResponse)).toBeTruthy();
    if (E.isRight(deleteResponse) && deleteResponse.value.data) {
      expect(deleteResponse.value.data.deletedWallets).toBe(toBeDeleted);
      expect(deleteResponse.value.data.notDeletedWallets).toBe(0);
    }
    testResponse(pagopaWallets.length, response);
    testResponse(bpdWallets.length, responseBpd);
    testResponse(faWallets.length, responseFa);
  };
});

it("should fails to set a non existing wallet as favourite", async () => {
  const response = await request.post(
    appendWalletV1Prefix(`/wallet/-1234/actions/favourite`)
  );
  expect(response.status).toBe(404);
});

it("services should return a valid transactions list", async () => {
  const response = await request.get(appendWalletV1Prefix("/transactions"));
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(E.isRight(list)).toBeTruthy();
  if (E.isRight(list)) {
    expect(list.value.data).toEqual(transactions.slice(0, transactionPageSize));
    if (list.value.data) {
      expect(list.value.data.length).toEqual(
        Math.min(transactionPageSize, transactions.length)
      );
    }
  }
});

it("services should return a valid transactions list slice", async () => {
  const response = await request.get(
    appendWalletV1Prefix(`/transactions?start=${transactionsTotal - 1}`)
  );
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(E.isRight(list)).toBeTruthy();
  if (E.isRight(list) && list.value.data) {
    expect(list.value.data.length).toEqual(1);
  }
});

it("services should return an empty data transactions", async () => {
  const response = await request.get(
    appendWalletV1Prefix(`/transactions?start=${transactionsTotal + 1}`)
  );
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(E.isRight(list)).toBeTruthy();
  if (E.isRight(list) && list.value.data) {
    expect(list.value.data.length).toEqual(0);
  }
});

it("should return a valid psp", async () => {
  const response = await request.get(appendWalletV1Prefix(`/psps/43188`));
  expect(response.status).toBe(200);
  const psp = Psp.decode(response.body);
  expect(E.isRight(psp)).toBeTruthy();
});

it("should return a valid psp list (v2)", async () => {
  const response = await request.get(
    appendWalletV2Prefix(`/payments/1234/psps?idWallet=1`)
  );
  expect(response.status).toBe(200);
  const psp = PspDataListResponse.decode(response.body);
  expect(E.isRight(psp)).toBeTruthy();
});
