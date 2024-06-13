import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { PaymentMethodManagementTypeEnum } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../generated/definitions/pagopa/walletv3/PaymentMethodStatus";
import { Range } from "../../../../generated/definitions/pagopa/walletv3/Range";
import { WalletInfoDetails } from "../../../../generated/definitions/pagopa/walletv3/WalletInfoDetails";
import { mockAvailablePspList } from "../payloads/transactions";

export const generateRandomCardBrand = () =>
  faker.helpers.arrayElement(["VISA", "MASTERCARD", "AMEX", "MAESTRO"]);

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
        max: Math.floor(Math.random() * 5000)
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
        max: Math.floor(Math.random() * 5000)
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
        max: Math.floor(Math.random() * 5000)
      } as Range
    ],
    methodManagement: PaymentMethodManagementTypeEnum.NOT_ONBOARDABLE
  },
  {
    id: "4",
    name: "POSTEPAY",
    description: "PostePay",
    asset:
      "https://github.com/pagopa/io-services-metadata/raw/master/logos/apps/paga-con-postepay.png",
    status: PaymentMethodStatusEnum.ENABLED,
    paymentTypeCode: "PPAY",
    ranges: [
      {
        min: 0,
        max: Math.floor(Math.random() * 5000)
      } as Range
    ],
    methodManagement: PaymentMethodManagementTypeEnum.REDIRECT
  }
];

export const generateWalletDetailsByPaymentMethod = (
  paymentMethodId: number
): { details: WalletInfoDetails; paymentMethodAsset: string } => {
  switch (paymentMethodId) {
    case 1:
    default:
      const brand = generateRandomCardBrand();
      return {
        details: {
          type: "CARDS",
          lastFourDigits: faker.finance.mask(4, false, false),
          expiryDate: format(faker.date.future(3), "yyyyMM"),
          brand
        },
        paymentMethodAsset:
          "https://github.com/pagopa/io-services-metadata/blob/master/logos/apps/carte-pagamento.png?raw=true"
      };
    case 2:
      return {
        details: {
          type: "PAYPAL",
          maskedEmail: faker.internet.email(),
          pspBusinessName: "Intesa Sanpaolo",
          pspId: mockAvailablePspList[0].idPsp || "1"
        },
        paymentMethodAsset:
          "https://github.com/pagopa/io-services-metadata/blob/master/logos/apps/paypal.png?raw=true"
      };
    case 3:
      return {
        details: {
          type: "BPAY",
          maskedNumber: faker.phone.number(),
          instituteCode: faker.random.numeric(5),
          bankName: faker.finance.accountName()
        },
        paymentMethodAsset:
          "https://github.com/pagopa/io-services-metadata/blob/master/logos/apps/bancomat-pay.png?raw=true"
      };
  }
};
