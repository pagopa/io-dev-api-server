import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { getFeaturedServicesResponsePayload } from "../payloads/get-featured-services";
import { addApiV2Prefix, serviceRouter } from "./router";

const serviceConfig = ioDevServerConfig.features.service;

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
