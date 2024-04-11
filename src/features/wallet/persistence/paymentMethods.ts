import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { ulid } from "ulid";
import { PaymentMethodManagementTypeEnum } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodStatus";
import { Range } from "../../../../generated/definitions/pagopa/walletv3/Range";
import { WalletInfoDetails } from "../../../../generated/definitions/pagopa/walletv3/WalletInfoDetails";

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
    ],
    methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE
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
    ],
    methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE
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
    ],
    methodManagement: PaymentMethodManagementTypeEnum.NOT_ONBOARDABLE
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
        brand: "VISA"
      };
    case 2:
      return {
        type: "PAYPAL",
        maskedEmail: faker.internet.email(),
        pspId: ulid()
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
