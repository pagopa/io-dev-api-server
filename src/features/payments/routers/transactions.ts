import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import TransactionsDB from "../persistence/transactions";

import { addTransactionHandler } from "./router";

const CONTINUATION_TOKEN_HEADER = "x-continuation-token";

addTransactionHandler("get", "/transactions", (req, res) => {
  const size = req.query.size ? Number(req.query.size) : 10;
  const offset = (req.headers[CONTINUATION_TOKEN_HEADER] !== undefined && req.headers[CONTINUATION_TOKEN_HEADER] !== 'undefined')
    ? Number(req.headers[CONTINUATION_TOKEN_HEADER])
    : 0;
  const transactions = TransactionsDB.getUserTransactions().slice(
    offset,
    offset + size
  );
  const continuationTokenHeader = {
    [CONTINUATION_TOKEN_HEADER]:
      TransactionsDB.getUserTransactions().length > offset + size
        ? offset + size
        : null
  };
  pipe(
    transactions,
    O.fromPredicate(transactions => transactions.length > 0),
    O.fold(
      () =>
        res.status(404).json({
          title: "No transactions found",
          status: 404,
          detail: "No transactions found for the user"
        }),
      transactions =>
        res.status(200).set(continuationTokenHeader).json(transactions)
    )
  );
});

addTransactionHandler("get", "/transactions/:transactionId", (req, res) => {
  pipe(
    req.params.transactionId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(400),
      transactionId => {
        const transaction = TransactionsDB.getTransactionDetails(transactionId);
        return pipe(
          transaction,
          O.fold(
            () => res.sendStatus(404),
            transaction => res.status(200).json(transaction)
          )
        );
      }
    )
  );
});
