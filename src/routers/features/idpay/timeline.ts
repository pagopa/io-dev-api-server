import { sequenceT } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import { getTimelineResponse } from "../../../payloads/features/idpay/timeline/get-timeline";
import { getTimelineDetailResponse } from "../../../payloads/features/idpay/timeline/get-timeline-detail";
import { initiativeIdFromString } from "../../../payloads/features/idpay/utils";
import { addIdPayHandler } from "./router";

const extractQuery = flow(
  O.fromNullable,
  O.map(toString),
  O.map(parseInt),
  O.toUndefined
);

/**
 *  Returns the list of transactions and operations of an initiative of a
 *  citizen sorted by date (newest->oldest)
 */
addIdPayHandler("get", "/timeline/:initiativeId", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(initiativeIdFromString),
    O.chain(initiativeId =>
      pipe(
        sequenceT(O.option)(
          O.of(initiativeId),
          O.of(pipe(req.query.page, extractQuery)),
          O.of(pipe(req.query.size, extractQuery))
        ),
        O.map(args => getTimelineResponse(...args))
      )
    ),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      timeline => res.status(200).json(timeline)
    )
  )
);

/**
 * Returns the detail of a transaction
 */
addIdPayHandler("get", "/timeline/:initiativeId/:operationId", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(initiativeIdFromString),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiativeId =>
        pipe(
          req.params.operationId,
          O.fromNullable,
          O.map(operationId =>
            getTimelineDetailResponse(initiativeId, operationId)
          ),
          O.fold(
            () => res.status(404).json(getIdPayError(404)),
            operation => res.status(200).json(operation)
          )
        )
    )
  )
);
