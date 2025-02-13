import { sequenceT } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ServiceScope } from "../../../../generated/definitions/backend/ServiceScope";
import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { getFeaturedInstitutionsResponsePayload } from "../payloads/get-featured-institutions";
import { getInstitutionsResponsePayload } from "../payloads/get-institutions";
import { getServicesByInstitutionIdResponsePayload } from "../payloads/get-services";
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
            O.of(pipe(req.query.limit as Query, extractQuery)),
            O.of(pipe(req.query.offset as Query, extractQuery)),
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
          O.chain(args => getInstitutionsResponsePayload(...args)),
          O.fold(
            () => res.status(404),
            instituitions => res.status(200).json(instituitions)
          )
        ),
      statusCode => res.sendStatus(statusCode)
    )
  )
);

// Find services for institution
addHandler(
  serviceRouter,
  "get",
  addApiV2Prefix("/institutions/:institutionId/services"),
  (req, res) =>
    pipe(
      serviceConfig.response.servicesByInstitutionIdResponseCode,
      O.fromPredicate(statusCode => statusCode !== 200),
      O.fold(
        () =>
          pipe(
            sequenceT(O.Monad)(
              O.fromNullable(req.params.institutionId),
              O.of(pipe(req.query.limit as Query, extractQuery)),
              O.of(pipe(req.query.offset as Query, extractQuery))
            ),
            O.chain(args => getServicesByInstitutionIdResponsePayload(...args)),
            O.fold(
              () => res.status(404),
              services => res.status(200).json(services)
            )
          ),
        statusCode => res.sendStatus(statusCode)
      )
    )
);

// Retrieve featured institutions
addHandler(
  serviceRouter,
  "get",
  addApiV2Prefix("/institutions/featured"),
  (_, res) =>
    pipe(
      serviceConfig.response.featuredInstitutionsResponseCode,
      O.fromPredicate(statusCode => statusCode !== 200),
      O.fold(
        () =>
          pipe(
            O.of(getFeaturedInstitutionsResponsePayload()),
            O.fold(
              () => res.status(404),
              featuredInstitutions => res.status(200).json(featuredInstitutions)
            )
          ),
        statusCode => res.sendStatus(statusCode)
      )
    )
);
