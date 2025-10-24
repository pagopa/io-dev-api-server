import _ from "lodash";
import { FavouriteService } from "../../../../../generated/definitions/services/FavouriteService";
import { ServiceDetails } from "../../../../../generated/definitions/services/ServiceDetails";
import { FavouritesConfiguration } from "../../types/configuration";

export interface IFavouriteServicesRepository {
  create(service: FavouriteService): void;
  delete(serviceId: string): boolean;
  findAll(): FavouriteService[];
  findById(serviceId: string): FavouriteService | undefined;
}

export class FavouriteServicesRepository
  implements IFavouriteServicesRepository
{
  private readonly servicesMap = new Map<string, FavouriteService>();

  initialize(
    config: FavouritesConfiguration["services"],
    services: ServiceDetails[] = []
  ) {
    if (services.length === 0) {
      return;
    }

    const randomServices = _.sampleSize(services, config.count);
    for (const service of randomServices) {
      const { id, name, organization } = service;
      const favouriteService: FavouriteService = {
        id,
        name,
        institution: {
          id: organization.fiscal_code,
          name: organization.name,
          fiscal_code: organization.fiscal_code
        }
      };
      this.create(favouriteService);
    }
  }

  create(service: FavouriteService) {
    this.servicesMap.set(service.id, service);
  }

  delete(serviceId: string) {
    return this.servicesMap.delete(serviceId);
  }

  findAll(): FavouriteService[] {
    return Array.from(this.servicesMap.values());
  }

  findById(serviceId: string) {
    return this.servicesMap.get(serviceId);
  }
}
