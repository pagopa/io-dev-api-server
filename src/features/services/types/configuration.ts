import { WithinRangeNumber } from "@pagopa/ts-commons/lib/numbers";
import * as t from "io-ts";
import { HttpResponseCode } from "../../../types/httpResponseCode";

export const FavouritesConfiguration = t.type({
  services: t.type({
    count: t.number
  })
});

export const ServicesConfiguration = t.type({
  // configure favourites feature
  favourites: FavouritesConfiguration,
  // configure number of featured institutions
  featuredInstitutionsSize: WithinRangeNumber(0, 6),
  // configure number of featured services
  featuredServicesSize: WithinRangeNumber(0, 6),
  // configure some API response error code
  response: t.type({
    getFeaturedInstitutionsResponseCode: HttpResponseCode,
    getFeaturedServicesResponseCode: HttpResponseCode,
    getInstitutionsResponseCode: HttpResponseCode,
    getServicesByInstitutionIdResponseCode: HttpResponseCode,
    getServiceByIdResponseCode: HttpResponseCode,
    getFavouriteServicesResponseCode: HttpResponseCode,
    deleteFavouriteServiceResponseCode: HttpResponseCode,
    getFavouriteServiceResponseCode: HttpResponseCode,
    putFavouriteServiceResponseCode: HttpResponseCode
  })
});

export type ServicesConfiguration = t.TypeOf<typeof ServicesConfiguration>;
