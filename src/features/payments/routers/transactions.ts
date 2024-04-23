import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import TransactionsDB from "../persistence/transactions";

import { addTransactionHandler } from "./router";

addTransactionHandler("get", "/transactions", (req, res) => {
  const size = req.query.size ? Number(req.query.size) : 10;
  const transactions = TransactionsDB.getUserTransactions().slice(0, size);
  pipe(
    transactions,
    O.fromPredicate(transactions => transactions.length > 0),
    O.fold(
      () => res.status(404).json({
        title: "No transactions found",
        status: 404,
        detail: "No transactions found for the user"
      }),
      transactions => res.status(200).json(transactions)
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