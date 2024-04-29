import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { getFeaturedItemsResponsePayload } from "../payloads/get-featured-items";
import { addApiV2Prefix, serviceRouter } from "./router";

const serviceConfig = ioDevServerConfig.features.service;

// Retrieve featured items
addHandler(serviceRouter, "get", addApiV2Prefix("/featured"), (_, res) =>
  pipe(
    serviceConfig.response.featuredItemsResponseCode,
    O.fromPredicate(statusCode => statusCode !== 200),
    O.fold(
      () =>
        pipe(
          O.of(getFeaturedItemsResponsePayload()),
          O.fold(
            () => res.status(404),
            featuredItems => res.status(200).json(featuredItems)
          )
        ),
      statusCode => res.sendStatus(statusCode)
    )
  )
);
