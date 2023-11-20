import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";
import {
  ClientIdEnum,
  NewTransactionResponse,
  SendPaymentResultOutcomeEnum
} from "../../../../../generated/definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentInfo } from "../../../../../generated/definitions/pagopa/ecommerce/PaymentInfo";
import { RptId } from "../../../../../generated/definitions/pagopa/ecommerce/RptId";
import { TransactionInfo } from "../../../../../generated/definitions/pagopa/ecommerce/TransactionInfo";
import { TransactionStatusEnum } from "../../../../../generated/definitions/pagopa/ecommerce/TransactionStatus";

export const getNewTransactionResponsePayload = (
  payments: ReadonlyArray<PaymentInfo>
): O.Option<NewTransactionResponse> =>
  O.some({
    transactionId: ulid(),
    payments,
    status: TransactionStatusEnum.ACTIVATED,
    authorizationCode: faker.datatype.string(10),
    clientId: ClientIdEnum.IO,
    sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.OK
  });

export const getTransactionInfoPayload = (
  transactionId: string
): O.Option<TransactionInfo> =>
  O.some({
    transactionId,
    payments: [
      {
        rptId: "77777777777302012387654312384" as RptId,
        amount: faker.datatype.number({
          min: 1,
          max: 9999
        }) as PaymentInfo["amount"]
      }
    ],
    status: TransactionStatusEnum.ACTIVATED,
    clientId: ClientIdEnum.IO,
    sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.OK
  });
