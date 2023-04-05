import * as O from "fp-ts/lib/Option";
import { OperationDTO } from "../../../../../generated/definitions/idpay/OperationDTO";
import { operationList } from "./data";
import { OperationTypeEnum } from "../../../../../generated/definitions/idpay/IbanOperationDTO";
import { IDPayInitiativeID } from "../types";

export const getTimelineDetailResponse = (
  initiativeId: IDPayInitiativeID,
  operationId: string
): O.Option<OperationDTO> => {
  const operation = operationList.find(o => o.operationId === operationId);

  return O.some({
    accrued: 0,
    amount: 0,
    brand: "",
    brandLogo: "",
    channel: "",
    circuitType: "",
    iban: "",
    idTrxAcquirer: "",
    idTrxIssuer: "",
    maskedPan: "",
    operationDate: new Date(),
    operationId: "",
    operationType: OperationTypeEnum.ADD_IBAN
  });
};
