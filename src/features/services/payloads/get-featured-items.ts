import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { FeaturedItem } from "../../../../generated/definitions/services/FeaturedItem";
import { FeaturedItems } from "../../../../generated/definitions/services/FeaturedItems";
import { ioDevServerConfig } from "../../../config";
import ServicesDB from "../../../persistence/services";
import { getInstitutionsResponsePayload } from "./get-institutions";

const featuredItemsSize = ioDevServerConfig.features.service.featuredItemsSize;

export const getFeaturedItemsResponsePayload = (): FeaturedItems => {
  // take some casual national service
  const selectedNationalServices = _.sampleSize(
    ServicesDB.getNationalServices(),
    1
  );
  // take some casual special service
  const selectedSpecialServices = _.sampleSize(
    ServicesDB.getSpecialServices(),
    3
  );
  // take some casual institutions
  const featuredIntitutions = _.sampleSize(
    Array.from(getInstitutionsResponsePayload().institutions),
    1
  );

  /**
   * Map national services to FeaturedService[] (add organization_name for layout testing purpose)
   */
  const featuredNationalServices: FeaturedItem[] = pipe(
    selectedNationalServices,
    A.map(service => ({
      id: service.service_id,
      name: service.service_name,
      version: service.version,
      organization_name: service.organization_name
    }))
  );

  /**
   * Reduce special services to FeaturedService[]
   */
  const featuredSpecialServices: FeaturedItem[] = pipe(
    selectedSpecialServices,
    A.map(service => ({
      id: service.service_id,
      name: service.service_name,
      version: service.version
    }))
  );

  // returns randomly ordered featured items
  const featuredItems = _.sampleSize(
    [
      ...featuredSpecialServices,
      ...featuredIntitutions,
      ...featuredNationalServices
    ],
    featuredItemsSize
  );

  return {
    items: featuredItems
  };
};
