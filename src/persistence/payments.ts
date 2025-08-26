import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { fakerIT as faker } from "@faker-js/faker";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { getRandomIntInRange } from "../utils/id";
import { PaymentNoticeNumber } from "../../generated/definitions/backend/PaymentNoticeNumber";
import { PaymentAmount } from "../../generated/definitions/backend/PaymentAmount";
import { PaymentDataWithRequiredPayee } from "../../generated/definitions/backend/PaymentDataWithRequiredPayee";
import { decodePayload } from "../utils/validator";
import { PaymentRequestsGetResponse } from "../../generated/definitions/backend/PaymentRequestsGetResponse";
import { EnteBeneficiario } from "../../generated/definitions/backend/EnteBeneficiario";
import { OrganizationName } from "../../generated/definitions/backend/OrganizationName";
import { RptId } from "../../generated/definitions/backend/RptId";
import { Detail_v2Enum } from "../../generated/definitions/backend/PaymentProblemJson";
import { CodiceContestoPagamento } from "../../generated/definitions/backend/CodiceContestoPagamento";
import { Iban } from "../../generated/definitions/backend/Iban";
import { SpezzoniCausaleVersamentoItem } from "../../generated/definitions/backend/SpezzoniCausaleVersamentoItem";
import {
  PaymentStatus,
  processablePayment,
  processedPayment
} from "../types/PaymentStatus";
import {
  detailV2EnumToPaymentProblemJSON,
  rptIdFromPaymentDataWithRequiredPayee
} from "../utils/payment";

const paymentData = new Map<string, PaymentDataWithRequiredPayee>();
const paymentStatuses = new Map<string, PaymentStatus>();

const addOrUpdatePayment = (
  paymentDataWithRequiredPayee: PaymentDataWithRequiredPayee
): PaymentDataWithRequiredPayee =>
  pipe(
    rptIdFromPaymentDataWithRequiredPayee(paymentDataWithRequiredPayee),
    rptId => paymentData.set(rptId, paymentDataWithRequiredPayee),
    _ => paymentDataWithRequiredPayee
  );

const addOrUpdatePaymentStatus = (
  rptId: RptId,
  paymentStatus: PaymentStatus
): PaymentStatus =>
  pipe(paymentStatuses.set(rptId, paymentStatus), _ => paymentStatus);

const createPaymentData = (
  organizationFiscalCode: OrganizationFiscalCode,
  invalidAfterDueDate: boolean = false,
  noticeNumber: PaymentNoticeNumber = `0${faker.string.numeric(
    17
  )}` as PaymentNoticeNumber,
  amount: PaymentAmount = getRandomIntInRange(1, 10000) as PaymentAmount
): E.Either<string[], PaymentDataWithRequiredPayee> =>
  pipe(
    {
      notice_number: noticeNumber,
      amount,
      invalid_after_due_date: invalidAfterDueDate,
      payee: {
        fiscal_code: organizationFiscalCode
      }
    },
    rawPaymentData =>
      decodePayload(PaymentDataWithRequiredPayee, rawPaymentData),
    E.map(addOrUpdatePayment)
  );

const createProcessablePayment = (
  rptId: RptId,
  amount: PaymentAmount,
  organizationFiscalCode: OrganizationFiscalCode,
  organizationName: OrganizationName,
  nativeDueDate: Date = faker.date.soon(),
  organizationUnitName: NonEmptyString = faker.string.alphanumeric(
    3
  ) as NonEmptyString,
  paymentContextCode: CodiceContestoPagamento = faker.string.alphanumeric(
    32
  ) as CodiceContestoPagamento,
  iban: Iban = faker.finance.iban() as Iban,
  paymentShortReason: SpezzoniCausaleVersamentoItem = faker.commerce.product() as SpezzoniCausaleVersamentoItem
): PaymentStatus =>
  pipe(
    {
      importoSingoloVersamento: amount,
      codiceContestoPagamento: paymentContextCode,
      ibanAccredito: iban,
      causaleVersamento: faker.finance.transactionDescription(),
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: organizationFiscalCode,
        denominazioneBeneficiario: organizationName,
        denomUnitOperBeneficiario: organizationUnitName
      } as EnteBeneficiario,
      spezzoniCausaleVersamento: [
        {
          spezzoneCausaleVersamento: paymentShortReason
        }
      ],
      dueDate: nativeDueDate.toISOString().split("T")[0]
    } as PaymentRequestsGetResponse,
    processablePayment,
    processablePayment => addOrUpdatePaymentStatus(rptId, processablePayment)
  );

const createProcessedPayment = (
  rptId: RptId,
  details: Detail_v2Enum
): PaymentStatus =>
  pipe(
    details,
    detailV2EnumToPaymentProblemJSON,
    processedPayment,
    processedPayment => addOrUpdatePaymentStatus(rptId, processedPayment)
  );

const getPaymentStatus = (rptId: RptId): O.Option<PaymentStatus> =>
  pipe(paymentStatuses.get(rptId), O.fromNullable);

export default {
  createPaymentData,
  createProcessablePayment,
  createProcessedPayment,
  getPaymentStatus
};
