/* eslint-disable sonarjs/no-duplicate-string */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ServiceId } from "../../../../generated/definitions/services/ServiceId";
import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import FavouritesRepository from "../persistence/favouritesRepository";
import ServicesDB from "../persistence/servicesDatabase";
import { getFavouriteServicesResponsePayload } from "../payloads/get-favourite-services";
import { extractQuery, Query } from "../utils";
import { addApiV2Prefix, serviceRouter } from "./router";

const serviceConfig = ioDevServerConfig.features.services;

// Retrieve all user favourite services
addHandler(
  serviceRouter,
  "get",
  addApiV2Prefix("/favourites/services"),
  (req, res) =>
    pipe(
      serviceConfig.response.getFavouriteServicesResponseCode,
      O.fromPredicate(statusCode => statusCode !== 200),
      O.fold(
        () =>
          pipe(
            O.of(pipe(req.query.continuation_token as Query, extractQuery)),
            O.chain(getFavouriteServicesResponsePayload),
            O.fold(
              () => res.status(404),
              favouriteServices => res.status(200).json(favouriteServices)
            )
          ),
        statusCode => res.sendStatus(statusCode)
      )
    )
);

// Retrieve user favourite service
addHandler(
  serviceRouter,
  "get",
  addApiV2Prefix("/favourites/services/:serviceId"),
  (req, res) =>
    pipe(
      serviceConfig.response.getFavouriteServiceResponseCode,
      O.fromPredicate(statusCode => statusCode !== 200),
      O.fold(
        () =>
          pipe(
            req.params.serviceId as ServiceId,
            O.fromNullable,
            O.chain(serviceId =>
              pipe(serviceId, FavouritesRepository.getService, O.fromNullable)
            ),
            O.fold(
              () => res.sendStatus(404),
              favouriteService => res.sendStatus(204).json(favouriteService)
            )
          ),
        statusCode => res.sendStatus(statusCode)
      )
    )
);

// Set user favourite service
addHandler(
  serviceRouter,
  "put",
  addApiV2Prefix("/favourites/services/:serviceId"),
  (req, res) =>
    pipe(
      serviceConfig.response.putFavouriteServiceResponseCode,
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
              ({ id, name, organization }) => {
                FavouritesRepository.addService({
                  id,
                  name,
                  institution: {
                    id: organization.fiscal_code,
                    name: organization.name,
                    fiscal_code: organization.fiscal_code
                  }
                });
                return res.sendStatus(204);
              }
            )
          ),
        statusCode => res.sendStatus(statusCode)
      )
    )
);

// Delete user favourite service
addHandler(
  serviceRouter,
  "delete",
  addApiV2Prefix("/favourites/services/:serviceId"),
  (req, res) =>
    pipe(
      serviceConfig.response.deleteFavouriteServiceResponseCode,
      O.fromPredicate(statusCode => statusCode !== 200),
      O.fold(
        () =>
          pipe(
            req.params.serviceId as ServiceId,
            O.fromNullable,
            O.fold(
              () => res.sendStatus(500),
              serviceId => {
                const hasBeenDelete =
                  FavouritesRepository.removeService(serviceId);
                return res.sendStatus(hasBeenDelete ? 204 : 500);
              }
            )
          ),
        statusCode => res.sendStatus(statusCode)
      )
    )
);
