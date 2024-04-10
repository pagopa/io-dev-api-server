import { faker } from "@faker-js/faker";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { ulid } from "ulid";
import { TransactionListItem } from "../../../../generated/definitions/pagopa/biz_events/TransactionListItem";

const transactionList: ReadonlyArray<TransactionListItem> = pipe(
  Array.from({ length: 500 }, () => ({
    transactionId: ulid(),
    payeeName: faker.company.name(),
    payeeTaxCode: faker.datatype.string(),
    amount: faker.commerce.price(50, 500, 2),
    transactionDate: faker.date.past().toISOString(),
    isCart: faker.datatype.boolean()
  })),
  transactions => _.sortBy(transactions, "transactionDate")
);

export { transactionList };
