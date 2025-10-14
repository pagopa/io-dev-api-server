import _ from "lodash";
import { ioDevServerConfig } from "../../../config";
import { FavouriteService } from "../../../../generated/definitions/services/FavouriteService";
import ServicesDB from "./servicesDatabase";

const favouriteServicesConfig =
  ioDevServerConfig.features.services.favourites.services;

const servicesMap = new Map<string, FavouriteService>();

const initializeServices = () => {
  const services = ServicesDB.getAllServices();

  if (services.length === 0) {
    throw new Error("No services found");
  }

  const randomServices = _.sampleSize(services, favouriteServicesConfig.count);
  for (const service of randomServices) {
    const { id, name, organization } = service;
    servicesMap.set(id, {
      id,
      name,
      institution: {
        id: organization.fiscal_code,
        name: organization.name,
        fiscal_code: organization.fiscal_code
      }
    });
  }
};

const getServices = () => Array.from(servicesMap.values());

const getService = (serviceId: string) => servicesMap.get(serviceId);

const addService = (service: FavouriteService) => {
  servicesMap.set(service.id, service);
};

const removeService = (serviceId: string) => servicesMap.delete(serviceId);

export default {
  initializeServices,
  getServices,
  getService,
  addService,
  removeService
};
