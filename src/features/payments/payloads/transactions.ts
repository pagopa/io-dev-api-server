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
import { Bundle } from "../../../../generated/definitions/pagopa/ecommerce/Bundle";

export const mockAvailablePspList: ReadonlyArray<Bundle> = [
  {
    idPsp: "1",
    abi: "01010",
    pspBusinessName: "BANCO di NAPOLI",
    taxPayerFee: 123,
    primaryCiIncurredFee: 123,
    idBundle: "A"
  },
  {
    idPsp: "2",
    abi: "01015",
    pspBusinessName: "Banco di Sardegna",
    taxPayerFee: 456,
    primaryCiIncurredFee: 456,
    idBundle: "B"
  },
  {
    idPsp: "3",
    abi: "03015",
    pspBusinessName: "FINECO",
    taxPayerFee: 789,
    primaryCiIncurredFee: 789,
    idBundle: "C"
  }
];

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
  _amount: number,
  idPspList?: ReadonlyArray<string>
): O.Option<CalculateFeeResponse> =>
  O.some({
    paymentMethodName: "VISA",
    paymentMethodDescription: "Test",
    paymentMethodStatus: PaymentMethodStatusEnum.ENABLED,
    asset:
      "https://github.com/pagopa/io-services-metadata/blob/master/logos/apps/carte-pagamento.png?raw=true",
    bundles: idPspList ? mockAvailablePspList.filter(psp => psp.idPsp && idPspList?.includes(psp.idPsp)) : mockAvailablePspList
  });
