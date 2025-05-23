import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { FeaturedService } from "../../../../generated/definitions/services/FeaturedService";
import { FeaturedServices } from "../../../../generated/definitions/services/FeaturedServices";
import { ioDevServerConfig } from "../../../config";
import ServicesDB from "../persistence/servicesDatabase";
import { cgnServiceId } from "../persistence/services/special/cgn-service";

const featuredServicesSize =
  ioDevServerConfig.features.service.featuredServicesSize;

export const getFeaturedServicesResponsePayload = (): FeaturedServices => {
  // take some casual national service
  const selectedNationalServices = _.sampleSize(
    ServicesDB.getNationalServices(),
    5
  );
  // take some casual special service
  const selectedSpecialServices = _.sampleSize(
    ServicesDB.getSpecialServices(),
    5
  );

  /**
   * Map national services to FeaturedService[] (add organization_name for layout testing purpose)
   */
  const featuredNationalServices: FeaturedService[] = pipe(
    selectedNationalServices,
    A.map(service => ({
      id: service.id,
      name: service.name,
      version: 1,
      organization_name: service.organization.name
    }))
  );

  /**
   * Map special services to FeaturedService[]
   */
  const featuredSpecialServices: FeaturedService[] = pipe(
    selectedSpecialServices,
    A.map(service => ({
      id: service.id,
      name: service.name,
      version: 1
    }))
  );

  // returns randomly ordered featured services
  const featuredServices = _.sampleSize(
    [...featuredSpecialServices, ...featuredNationalServices],
    featuredServicesSize
  );

  // CGN Service
  const cgnSpecialService = featuredSpecialServices.find(
    service => service.id === cgnServiceId
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [first, ...rest] = featuredServices;

  return {
    services: cgnSpecialService
      ? [
          cgnSpecialService,
          ...rest.filter(service => service.id !== cgnSpecialService.id)
        ]
      : featuredServices
  };
};
