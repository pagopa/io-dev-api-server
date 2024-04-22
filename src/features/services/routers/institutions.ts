import { sequenceT } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ServiceScope } from "../../../../generated/definitions/backend/ServiceScope";
import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { getInstitutionsResponsePayload } from "../payloads/get-institutions";
import { addApiV2Prefix, serviceRouter } from "./router";

const serviceConfig = ioDevServerConfig.features.service;

type Query = string | qs.ParsedQs | string[] | qs.ParsedQs[] | undefined;

const extractQuery = (query: Query) =>
  pipe(
    query,
    O.fromNullable,
    O.map(s => parseInt(s as string, 10)),
    O.toUndefined
  );

// Find institutions
addHandler(serviceRouter, "get", addApiV2Prefix("/institutions"), (req, res) =>
  pipe(
    serviceConfig.response.institutionsResponseCode,
    O.fromPredicate(statusCode => statusCode !== 200),
    O.fold(
      () =>
        pipe(
          sequenceT(O.Monad)(
            O.of(pipe(req.query.limit, extractQuery)),
            O.of(pipe(req.query.offset, extractQuery)),
            O.of(
              pipe(
                req.query.scope,
                ServiceScope.decode,
                O.fromEither,
                O.toUndefined
              )
            ),
            O.of(
              pipe(req.query.search as string, O.fromNullable, O.toUndefined)
            )
          ),
          O.map(args => getInstitutionsResponsePayload(...args)),
          O.fold(
            () => res.status(404),
            instituitions => res.status(200).json(instituitions)
          )
        ),
      statusCode => res.sendStatus(statusCode)
    )
  )
);
