import { faker } from "@faker-js/faker";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { NoticeListItem } from "../../../../generated/definitions/pagopa/transactions/NoticeListItem";
import { NoticeDetailResponse } from "../../../../generated/definitions/pagopa/transactions/NoticeDetailResponse";
import { TransactionInfo } from "../../../../generated/definitions/pagopa/ecommerce/TransactionInfo";
import { generateRandomInfoTransaction } from "../utils/transactions";
import { ioDevServerConfig } from "../../../config";

const mockedTaxCodes = ["1199250158", "13756881002", "262700362", "31500945"];

type TransactionId = NoticeListItem["eventId"];

const userTransactions = new Map<TransactionId, NoticeListItem>();
const transactions = new Map<TransactionId, NoticeDetailResponse>();

const getUserTransactions = () =>
  Array.from(userTransactions.size > 0 ? userTransactions.values() : []);

const getTransactionDetails = (transactionId: TransactionId) =>
  pipe(
    transactions,
    O.fromNullable,
    O.chain(transactions => O.fromNullable(transactions.get(transactionId)))
  );

const addUserTransaction = (transaction: NoticeListItem) => {
  userTransactions.set(transaction.eventId, transaction);
};

const removeUserTransaction = (transactionId: TransactionId) => {
  userTransactions.delete(transactionId);
  removeTransactionDetails(transactionId);
};

const addTransactionDetails = (
  transactionId: TransactionId,
  transaction: NoticeDetailResponse
) => {
  transactions.set(transactionId, transaction);
};

const removeTransactionDetails = (transactionId: TransactionId) => {
  transactions.delete(transactionId);
};

const generateUserTransaction = (
  eventId: TransactionId,
  idx: number,
  additionalTransactionInfo: Partial<TransactionInfo> = {}
) => {
  const payeeTaxCode =
    mockedTaxCodes[
      faker.datatype.number({ min: 0, max: mockedTaxCodes.length - 1 })
    ];
  const randomTransaction: NoticeListItem = {
    eventId,
    payeeName: faker.company.name(),
    payeeTaxCode,
    isDebtor: false,
    isPayer: true,
    amount: additionalTransactionInfo.payments?.[0]?.amount.toString() || "",
    noticeDate: new Date(
      new Date().setDate(new Date().getDate() - 2 * idx)
    ).toISOString(),
    isCart: false
  };

  const cartList = Array.from(
    { length: faker.datatype.number({ min: 1, max: 2 }) },
    () => ({
      subject: faker.lorem.sentence(faker.datatype.number({ min: 2, max: 4 })),
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
    })
  );
  // eslint-disable-next-line functional/immutable-data
  randomTransaction.isCart = cartList.length > 1;
  // eslint-disable-next-line functional/immutable-data
  randomTransaction.amount = cartList
    .reduce((acc, item) => acc + Number(item.amount), 0)
    .toString();
  addUserTransaction(randomTransaction);

  const randomTransactionDetails: NoticeDetailResponse = {
    infoNotice: generateRandomInfoTransaction(cartList),
    carts: cartList
  };
  addTransactionDetails(eventId, randomTransactionDetails);
  return randomTransaction;
};

const generateUserTransactionData = () => {
  for (
    // eslint-disable-next-line functional/no-let
    let i = 0;
    i < ioDevServerConfig.features.payments.numberOfTransactions;
    i = i + 1
  ) {
    generateUserTransaction(faker.datatype.uuid(), i);
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
