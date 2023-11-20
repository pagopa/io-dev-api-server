import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { ulid } from "ulid";
import { NewTransactionRequest } from "../../../../../generated/definitions/pagopa/ecommerce/NewTransactionRequest";
import { PaymentNoticeInfo } from "../../../../../generated/definitions/pagopa/ecommerce/PaymentNoticeInfo";
import { TransactionInfo } from "../../../../../generated/definitions/pagopa/ecommerce/TransactionInfo";
import { TransactionStatusEnum } from "../../../../../generated/definitions/pagopa/ecommerce/TransactionStatus";
import { getPayment } from "./payments";

const transactionsData = new Map<string, TransactionInfo>();

const upsertTransaction = (transaction: TransactionInfo): TransactionInfo =>
  pipe(
    transaction,
    ({ transactionId }) => transactionsData.set(transactionId, transaction),
    _ => transaction
  );

const createTransaction = (
  paymentNotices: ReadonlyArray<PaymentNoticeInfo>
): O.Option<TransactionInfo> =>
  pipe(
    NewTransactionRequest.decode({ paymentNotices }),
    O.fromEither,
    O.map(({ paymentNotices }) => paymentNotices.map(({ rptId }) => rptId)), // PaymentNoticeInfo[] -> RptId[]
    O.chain(flow(A.map(getPayment), A.filter(O.isSome), A.sequence(O.Monad))), // RptId[] -> PaymentInfo[]
    O.map(
      payments =>
        ({
          transactionId: ulid(),
          status: TransactionStatusEnum.ACTIVATED,
          payments
        } as TransactionInfo)
    ),
    O.map(upsertTransaction)
  );

const getTransaction = (transactionId: string): O.Option<TransactionInfo> =>
  O.fromNullable(transactionsData.get(transactionId));

const deleteTransaction = (transactionId: string): boolean =>
  transactionsData.delete(transactionId);

export {
  createTransaction,
  deleteTransaction,
  getTransaction,
  upsertTransaction
};
