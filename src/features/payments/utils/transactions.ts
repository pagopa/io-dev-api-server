import { faker } from "@faker-js/faker";
import { ulid } from "ulid";
import { InfoTransactionView, OriginEnum, PaymentMethodEnum } from "../../../../generated/definitions/pagopa/transactions/InfoTransactionView";

export const PAYMENT_METHODS_TRANSACTIONS_MOCK = [
  {
    logo: "https://assets.cdn.platform.pagopa.it/creditcard/visa.png",
    brand: "VISA",
    name: "Visa"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/creditcard/mastercard.png",
    brand: "MASTERCARD",
    name: "Mastercard"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/creditcard/amex.png",
    brand: "AMEX",
    name: "Amex"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/creditcard/maestro.png",
    brand: "MAESTRO",
    name: "Maestro"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/apm/paypal.png",
    brand: "PAYPAL",
    name: "PayPal"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/apm/mybank.png",
    brand: "MYBANK",
    name: "MyBank"
  }
];

export const generateRandomInfoTransaction = (
  transactionId?: string
): InfoTransactionView => {
  const randomPaymentMethod = faker.helpers.arrayElement(
    PAYMENT_METHODS_TRANSACTIONS_MOCK
  );
  return {
    transactionId: transactionId ?? ulid(),
    authCode: faker.random.alphaNumeric(6),
    rrn: faker.random.numeric(12),
    transactionDate: new Date().toISOString(),
    pspName: "Intesa Sanpaolo",
    walletInfo: {
      accountHolder: faker.name.fullName(),
      brand: randomPaymentMethod.brand
    },
    paymentMethod: PaymentMethodEnum.PPAL,
    payer: {
      name: faker.name.fullName(),
      taxCode: faker.random.alphaNumeric(16).toLocaleUpperCase()
    },
    amount: faker.finance.amount(1, 1000),
    fee: faker.finance.amount(0.1, 10),
    origin: OriginEnum.INTERNAL
  };
};
