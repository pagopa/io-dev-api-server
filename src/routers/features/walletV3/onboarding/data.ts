import { PaymentMethodStatusEnum } from "../../../../../generated/definitions/pagopa/walletv3/PaymentMethodStatus";
import { PaymentMethodsResponse } from "../../../../../generated/definitions/pagopa/walletv3/PaymentMethodsResponse";
import { Range } from "../../../../../generated/definitions/pagopa/walletv3/Range";

export const allPaymentMethods: PaymentMethodsResponse = {
  paymentMethods: [
    {
      id: "1",
      name: "Carta di credito",
      description: "Pagamento con carta di credito",
      asset: "creditCard",
      status: PaymentMethodStatusEnum.ENABLED,
      paymentTypeCode: "string",
      ranges: [
        {
          min: 0,
          max: 1000
        } as Range
      ]
    },
    {
      id: "2",
      name: "BANCOMAT Pay",
      description: "Pagamento con BANCOMAT Pay",
      asset: "bancomatPay",
      status: PaymentMethodStatusEnum.ENABLED,
      paymentTypeCode: "string",
      ranges: [
        {
          min: 0,
          max: 500
        } as Range
      ]
    }
  ]
};
