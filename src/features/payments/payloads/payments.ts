import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ulid } from "ulid";
import { ServicePublic } from "../../../../generated/definitions/backend/ServicePublic";
import { CalculateFeeResponse } from "../../../../generated/definitions/pagopa/ecommerce/CalculateFeeResponse";
import {
  ClientIdEnum,
  NewTransactionResponse,
  SendPaymentResultOutcomeEnum
} from "../../../../generated/definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentInfo } from "../../../../generated/definitions/pagopa/ecommerce/PaymentInfo";
import { PaymentMethodStatusEnum } from "../../../../generated/definitions/pagopa/ecommerce/PaymentMethodStatus";
import { PaymentRequestsGetResponse } from "../../../../generated/definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../generated/definitions/pagopa/ecommerce/RptId";
import { TransactionInfo } from "../../../../generated/definitions/pagopa/ecommerce/TransactionInfo";
import { TransactionStatusEnum } from "../../../../generated/definitions/pagopa/ecommerce/TransactionStatus";
import ServicesDB from "../../../persistence/services";

export const getPaymentRequestsGetResponse = (
  rptId: RptId
): O.Option<PaymentRequestsGetResponse> =>
  pipe(
    ServicesDB.getSummaries(),
    faker.helpers.arrayElement,
    ({ service_id }) => service_id,
    ServicesDB.getService,
    O.fromNullable,
    O.map((randomService: ServicePublic) => ({
      rptId,
      amount: faker.datatype.number({
        min: 1,
        max: 9999
      }) as PaymentRequestsGetResponse["amount"],
      paFiscalCode: randomService.organization_fiscal_code,
      paName: randomService.organization_name,
      description: faker.finance.transactionDescription(),
      dueDate: faker.date.future()
    }))
  );

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
    asset:
      "https://github.com/pagopa/io-services-metadata/blob/master/logos/apps/carte-pagamento.png?raw=true",
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
