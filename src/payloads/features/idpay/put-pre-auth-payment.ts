import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";
import { getRandomEnumValue } from "../../utils/random";
import {
  AuthPaymentResponseDTO,
  StatusEnum
} from "../../../../generated/definitions/idpay/AuthPaymentResponseDTO";

const generateRandomAuthPaymentResponseDTO = (): AuthPaymentResponseDTO => ({
  amountCents: faker.datatype.number(1000),
  id: ulid(),
  initiativeId: ulid(),
  rejectionReasons: [],
  status: getRandomEnumValue(StatusEnum),
  trxCode: faker.datatype.string(),
  reward: 0,
  businessName: faker.company.name(),
  initiativeName: faker.commerce.productName(),
  trxDate: faker.date.recent(),
});

export const putPreAuthPaymentResponse = (
  _trxCode: string
): O.Option<AuthPaymentResponseDTO> =>
  O.some(generateRandomAuthPaymentResponseDTO());
