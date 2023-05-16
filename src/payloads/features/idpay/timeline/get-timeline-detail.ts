import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { OperationDTO } from "../../../../../generated/definitions/idpay/OperationDTO";
import { getInitiativeTimelineDetails } from "./data";

export const getTimelineDetailResponse = (
  initiativeId: string,
  operationId: string
): O.Option<OperationDTO> =>
  pipe(
    getInitiativeTimelineDetails(initiativeId),
    O.fromNullable,
    O.chain(details =>
      pipe(
        details.find(o => o.operationId === operationId),
        O.fromNullable
      )
    )
  );
