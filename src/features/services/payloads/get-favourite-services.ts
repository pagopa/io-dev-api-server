import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { FavouriteServicesResource } from "../../../../generated/definitions/services/FavouriteServicesResource";
import favouriteServicesRepository from "../persistence";

const PAGE_SIZE = 10;

export const getFavouriteServicesResponsePayload = (
  offset: number = 0
): O.Option<FavouriteServicesResource> => {
  const services = favouriteServicesRepository.findAll();

  const totalElements = services.length;
  const startIndex = offset;
  const endIndex = offset + PAGE_SIZE;
  const favouriteServices = _.slice(services, startIndex, endIndex);

  return O.some({
    favourite_services: favouriteServices,
    continuation_token: endIndex < totalElements ? String(endIndex) : undefined
  });
};
