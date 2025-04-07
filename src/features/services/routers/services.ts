import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ServiceId } from "../../../../generated/definitions/services/ServiceId";
import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { getFeaturedServicesResponsePayload } from "../payloads/get-featured-services";
import ServicesDB from "../persistence/servicesDatabase";
import { addApiV2Prefix, serviceRouter } from "./router";

const serviceConfig = ioDevServerConfig.features.service;

// Retrive service by id
addHandler(
  serviceRouter,
  "get",
  addApiV2Prefix("/services/:serviceId"),
  (req, res) =>
    pipe(
      serviceConfig.response.serviceByIdResponseCode,
      O.fromPredicate(statusCode => statusCode !== 200),
      O.fold(
        () =>
          pipe(
            req.params.serviceId as ServiceId,
            O.fromNullable,
            O.chain(serviceId =>
              pipe(serviceId, ServicesDB.getService, O.fromNullable)
            ),
            O.fold(
              () => res.sendStatus(404),
              service => res.status(200).json(service)
            )
          ),
        statusCode => res.sendStatus(statusCode)
      )
    )
);

// Retrieve featured services
addHandler(
  serviceRouter,
  "get",
  addApiV2Prefix("/services/featured"),
  (_, res) =>
    pipe(
      serviceConfig.response.featuredServicesResponseCode,
      O.fromPredicate(statusCode => statusCode !== 200),
      O.fold(
        () =>
          pipe(
            O.of(getFeaturedServicesResponsePayload()),
            O.fold(
              () => res.status(404),
              featuredServices => res.status(200).json(featuredServices)
            )
          ),
        statusCode => res.sendStatus(statusCode)
      )
    )
);
