import { faker } from "@faker-js/faker";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { TransactionListItem } from "../../../../generated/definitions/pagopa/transactions/TransactionListItem";
import { TransactionDetailResponse } from "../../../../generated/definitions/pagopa/transactions/TransactionDetailResponse";
import { TransactionInfo } from "../../../../generated/definitions/pagopa/ecommerce/TransactionInfo";
import { generateRandomInfoTransaction } from "../utils/transactions";
import { ioDevServerConfig } from "../../../config";

const mockedTaxCodes = ["1199250158", "13756881002", "262700362", "31500945"];

type TransactionId = TransactionListItem["transactionId"];

const userTransactions = new Map<TransactionId, TransactionListItem>();
const transactions = new Map<TransactionId, TransactionDetailResponse>();

const getUserTransactions = () =>
  Array.from(userTransactions.size > 0 ? userTransactions.values() : []);

const getTransactionDetails = (transactionId: TransactionId) =>
  pipe(
    transactions,
    O.fromNullable,
    O.chain(transactions => O.fromNullable(transactions.get(transactionId)))
  );

const addUserTransaction = (transaction: TransactionListItem) => {
  userTransactions.set(transaction.transactionId, transaction);
};

const removeUserTransaction = (transactionId: TransactionId) => {
  userTransactions.delete(transactionId);
  removeTransactionDetails(transactionId);
};

const addTransactionDetails = (
  transactionId: TransactionId,
  transaction: TransactionDetailResponse
) => {
  transactions.set(transactionId, transaction);
};

const removeTransactionDetails = (transactionId: TransactionId) => {
  transactions.delete(transactionId);
};

const generateUserTransaction = (
  transactionId: TransactionId,
  additionalTransactionInfo: Partial<TransactionInfo> = {}
) => {
  const payeeTaxCode = mockedTaxCodes[faker.datatype.number({ min: 0, max: mockedTaxCodes.length - 1 })];
  const randomTransaction: TransactionListItem = {
    transactionId,
    payeeName: faker.company.name(),
    payeeTaxCode,
    amount: additionalTransactionInfo.payments?.[0]?.amount.toString(),
    transactionDate: new Date().toISOString(),
    isCart: false,
  };

  const cartList = Array.from({ length: faker.datatype.number({ min: 1, max: 2 }) }, () => ({
    subject: faker.lorem.sentence(
      faker.datatype.number({ min: 2, max: 4 })
    ),
    amount: faker.finance.amount(1, 1000),
    payee: {
      name: randomTransaction.payeeName,
      taxCode: randomTransaction.payeeTaxCode
    },
    debtor: {
      name: faker.name.fullName(),
      taxCode: faker.random.alphaNumeric(16).toUpperCase()
    },
    refNumberType: "IBAN",
    refNumberValue: faker.datatype
      .number({ min: 100000000000, max: 999999999999 })
      .toString()
  }));
  // eslint-disable-next-line functional/immutable-data
  randomTransaction.isCart = cartList.length > 1;
  // eslint-disable-next-line functional/immutable-data
  randomTransaction.amount = cartList.reduce(
    (acc, item) => acc + Number(item.amount),
    0
  ).toString();
  addUserTransaction(randomTransaction);

  const randomTransactionDetails: TransactionDetailResponse = {
    infoTransaction: generateRandomInfoTransaction(cartList),
    carts: cartList
  };
  addTransactionDetails(transactionId, randomTransactionDetails);
  return randomTransaction;
};

const generateUserTransactionData = () => {
  for (
    // eslint-disable-next-line functional/no-let
    let i = 0;
    i < ioDevServerConfig.features.payments.numberOfTransactions;
    i = i + 1
  ) {
    generateUserTransaction(faker.datatype.uuid());
  }
};

// At server startup
generateUserTransactionData();

export default {
  addUserTransaction,
  getUserTransactions,
  getTransactionDetails,
  generateUserTransaction,
  removeUserTransaction
};
