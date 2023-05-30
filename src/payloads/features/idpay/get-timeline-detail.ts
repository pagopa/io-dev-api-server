import { faker } from "@faker-js/faker/locale/it";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ulid } from "ulid";
import { OperationDTO } from "../../../../generated/definitions/idpay/OperationDTO";
import { OperationListDTO } from "../../../../generated/definitions/idpay/OperationListDTO";
import {
  OperationTypeEnum as TransactionDetailEnum,
  StatusEnum
} from "../../../../generated/definitions/idpay/TransactionDetailDTO";
import { initiativeTimeline } from "../../../persistence/idpay";

const generateRandomOperationDetailDTO = (
  operation: OperationListDTO
): OperationDTO | undefined => {
  switch (operation.operationType) {
    case "PAID_REFUND":
    case "REJECTED_REFUND":
      return {
        ...operation,
        cro: ulid(),
        iban: faker.finance.iban(false, "IT"),
        startDate: faker.date.recent(),
        endDate: faker.date.recent(),
        transferDate: faker.date.recent()
      };
    case "TRANSACTION":
      return {
        ...operation,
        operationType: TransactionDetailEnum.TRANSACTION,
        idTrxAcquirer: ulid(),
        idTrxIssuer: ulid(),
        status: StatusEnum.AUTHORIZED,
      };
    case "REVERSAL":
      return {
        ...operation,
        operationType: TransactionDetailEnum.REVERSAL,
        idTrxAcquirer: ulid(),
        idTrxIssuer: ulid(),
        status: StatusEnum.AUTHORIZED
      };
  }
};

export const getTimelineDetailResponse = (
  initiativeId: string,
  operationId: string
): O.Option<OperationDTO> =>
  pipe(
    initiativeTimeline[initiativeId],
    O.fromNullable,
    O.map(timeline => timeline.find(o => o.operationId === operationId)),
    O.chain(O.fromNullable),
    O.map(generateRandomOperationDetailDTO),
    O.chain(O.fromNullable)
  );
