import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { PaymentMethodResponse } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodStatus";
import { Range } from "../../../../generated/definitions/pagopa/walletv3/Range";
import {
  BrandEnum,
  WalletInfoDetails
} from "../../../../generated/definitions/pagopa/walletv3/WalletInfoDetails";
import { getRandomEnumValue } from "../../../payloads/utils/random";

export const paymentMethodsDB: ReadonlyArray<PaymentMethodResponse> = [
  {
    id: "1",
    name: "CARDS",
    description: "Carte di credito o debito",
    asset: "https://assets.cdn.platform.pagopa.it/creditcard/generic.png",
    status: PaymentMethodStatusEnum.ENABLED,
    paymentTypeCode: "CP",
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
    asset: "https://assets.cdn.platform.pagopa.it/apm/paypal.png",
    status: PaymentMethodStatusEnum.ENABLED,
    paymentTypeCode: "PPAL",
    ranges: [
      {
        min: 0,
        max: 500
      } as Range
    ]
  },
  {
    id: "3",
    name: "BANCOMATPAY",
    description: "BANCOMAT Pay",
    asset: "https://assets.cdn.platform.pagopa.it/apm/bancomatpay.png",
    status: PaymentMethodStatusEnum.ENABLED,
    paymentTypeCode: "BPAY",
    ranges: [
      {
        min: 0,
        max: 1000
      } as Range
    ]
  }
];

export const generateWalletDetailsByPaymentMethod = (
  paymentMethodId: number
): WalletInfoDetails => {
  switch (paymentMethodId) {
    case 1:
    default:
      return {
        type: "CARDS",
        lastFourDigits: faker.finance.mask(4, false, false),
        expiryDate: format(faker.date.future(3), "yyyyMM"),
        brand: getRandomEnumValue(BrandEnum)
      };
    case 2:
      return {
        type: "PAYPAL",
        abi: faker.random.numeric(5),
        maskedEmail: faker.internet.email()
      };
    case 3:
      return {
        type: "BPAY",
        maskedNumber: faker.phone.number(),
        instituteCode: faker.random.numeric(5),
        bankName: faker.finance.accountName()
      };
  }
};
