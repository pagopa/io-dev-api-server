import { PaymentMethodStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodStatus";
import { PaymentMethodsResponse } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodsResponse";
import { Range } from "../../../../generated/definitions/pagopa/walletv3/Range";

export const allPaymentMethods: PaymentMethodsResponse = {
  paymentMethods: [
    {
      id: "1",
      name: "CARDS",
      description: "Carta di credito",
      status: PaymentMethodStatusEnum.ENABLED,
      paymentTypeCode: "CARDS",
      ranges: [
        {
          min: 0,
          max: 1000
        } as Range
      ]
    },
    {
      id: "2",
      name: "PAYPAL",
      description: "PayPal",
      asset:
        "https://github.com/pagopa/io-services-metadata/blob/master/logos/apps/paypal.png?raw=true",
      status: PaymentMethodStatusEnum.ENABLED,
      paymentTypeCode: "PAYPAL",
      ranges: [
        {
          min: 0,
          max: 500
        } as Range
      ]
    }
  ]
};
