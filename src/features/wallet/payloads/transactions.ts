import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";
import { CalculateFeeResponse } from "../../../../generated/definitions/pagopa/ecommerce/CalculateFeeResponse";
import {
  ClientIdEnum,
  NewTransactionResponse,
  SendPaymentResultOutcomeEnum
} from "../../../../generated/definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentInfo } from "../../../../generated/definitions/pagopa/ecommerce/PaymentInfo";
import { PaymentMethodStatusEnum } from "../../../../generated/definitions/pagopa/ecommerce/PaymentMethodStatus";
import { RptId } from "../../../../generated/definitions/pagopa/ecommerce/RptId";
import { TransactionInfo } from "../../../../generated/definitions/pagopa/ecommerce/TransactionInfo";
import { TransactionStatusEnum } from "../../../../generated/definitions/pagopa/ecommerce/TransactionStatus";

export const getNewTransactionResponsePayload = (
  payments: ReadonlyArray<PaymentInfo>
): O.Option<NewTransactionResponse> =>
  O.some({
    transactionId: ulid(),
    payments,
    status: TransactionStatusEnum.ACTIVATION_REQUESTED,
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

export const getCalculateFeeResponsePayload = (
  _walletId: string | undefined,
  _amount: number
): O.Option<CalculateFeeResponse> =>
  O.some({
    paymentMethodName: "VISA",
    paymentMethodDescription: "Test",
    paymentMethodStatus: PaymentMethodStatusEnum.ENABLED,
    bundles: [
      {
        abi: "01010",
        taxPayerFee: 123,
        primaryCiIncurredFee: 123,
        bundleName: "BANCO di NAPOLI",
        idBundle: "A"
      },
      {
        abi: "01015",
        bundleName: "Banco di Sardegna",
        taxPayerFee: 456,
        primaryCiIncurredFee: 456,
        idBundle: "B"
      },
      {
        abi: "03015",
        bundleName: "FINECO",
        taxPayerFee: 789,
        primaryCiIncurredFee: 789,
        idBundle: "C"
      }
    ]
  });
