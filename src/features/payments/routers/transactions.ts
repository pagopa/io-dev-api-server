import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import TransactionsDB from "../persistence/transactions";
import { sendFileFromRootPath } from "../../../utils/file";

import { TransactionListWrapResponse } from "../../../../generated/definitions/pagopa/transactions/TransactionListWrapResponse";
import { addTransactionHandler } from "./router";

const CONTINUATION_TOKEN_HEADER = "x-continuation-token";

addTransactionHandler("get", "/transactions", (req, res) => {
  const size = req.query.size ? Number(req.query.size) : 10;
  const offset =
    req.headers[CONTINUATION_TOKEN_HEADER] !== undefined &&
    req.headers[CONTINUATION_TOKEN_HEADER] !== "undefined"
      ? Number(req.headers[CONTINUATION_TOKEN_HEADER])
      : 0;
  const response: TransactionListWrapResponse = {
    transactions: TransactionsDB.getUserTransactions().slice(
      offset,
      offset + size
    )
  };
  const continuationToken =
    TransactionsDB.getUserTransactions().length > offset + size
      ? (offset + size).toString()
      : undefined;
  pipe(
    response.transactions,
    O.fromNullable,
    O.chain(O.fromPredicate(transactions => transactions.length > 0)),
    O.fold(
      () =>
        res.status(404).json({
          title: "No transactions found",
          status: 404,
          detail: "No transactions found for the user"
        }),
      _ => {
        if (continuationToken) {
          res.setHeader(CONTINUATION_TOKEN_HEADER, continuationToken);
        }
        return res.status(200).json(response);
      }
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

addTransactionHandler("get", "/transactions/:transactionId/pdf", (req, res) => {
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
            _ => {
              sendFileFromRootPath(
                "assets/payments/receipts/loremIpsum.pdf",
                res
              );
              return res;
            }
          )
        );
      }
    )
  );
});
