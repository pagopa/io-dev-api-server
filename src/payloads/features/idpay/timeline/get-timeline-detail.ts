import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { OperationDTO } from "../../../../../generated/definitions/idpay/OperationDTO";
import { IDPayInitiativeID } from "../types";
import { timelineDetails } from "./data";

export const getTimelineDetailResponse = (
  initiativeId: IDPayInitiativeID,
  operationId: string
): O.Option<OperationDTO> =>
  pipe(
    timelineDetails[initiativeId],
    O.fromNullable,
    O.chain(details =>
      pipe(
        details.find(o => o.operationId === operationId),
        O.fromNullable
      )
    )
  );
