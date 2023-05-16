import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { OperationDTO } from "../../../../generated/definitions/idpay/OperationDTO";
import { initiativeTimelineDetails } from "../../../persistence/idpay";

export const getTimelineDetailResponse = (
  initiativeId: string,
  operationId: string
): O.Option<OperationDTO> =>
  pipe(
    initiativeTimelineDetails[initiativeId],
    O.fromNullable,
    O.chain(details =>
      pipe(
        details.find(o => o.operationId === operationId),
        O.fromNullable
      )
    )
  );
