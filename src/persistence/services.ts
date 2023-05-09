import { PaginatedServiceTupleCollection } from "../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServiceId } from "../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../generated/definitions/backend/ServicePreference";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import ServiceFactory, {
  SpecialServiceGenerator
} from "../payloads/services/factory";
import { createCdcService } from "../payloads/services/special/cdc/factoryCDCService";
import {
  cgnServiceId,
  createCgnService
} from "../payloads/services/special/cgn/factoryCGNService";
import { createFciService } from "../payloads/services/special/fci/factoryFCIService";
import { createPnService } from "../payloads/services/special/pn/factoryPn";
import { createSiciliaVolaService } from "../payloads/services/special/siciliaVola/factorySiciliaVolaService";
import { isCgnActivated } from "../routers/features/cgn";
import { IoDevServerConfig } from "../types/config";
import { validatePayload } from "../utils/validator";
import { ServiceScopeEnum } from "../../generated/definitions/backend/ServiceScope";

let localServices: ServicePublic[] = [];
let nationalServices: ServicePublic[] = [];
let specialServices: ServicePublic[] = [];
let servicePreferences: Map<ServiceId, ServicePreference> = new Map<
  ServiceId,
  ServicePreference
>();

const createServices = (customConfig: IoDevServerConfig) => {
  const localServiceCount = customConfig.services.local;
  localServices = ServiceFactory.createLocalServices(localServiceCount, 0);

  const nationalServiceCount = customConfig.services.national;
  nationalServices = ServiceFactory.createNationalServices(
    nationalServiceCount,
    localServiceCount
  );

  const specialServicesConfig = customConfig.services.specialServices;
  const specialServiceGenerators: [boolean, SpecialServiceGenerator][] = [
    [specialServicesConfig.siciliaVola, createSiciliaVolaService],
    [specialServicesConfig.cgn, createCgnService],
    [specialServicesConfig.cdc, createCdcService],
    [specialServicesConfig.pn, createPnService],
    [specialServicesConfig.fci, createFciService]
  ];
  const specialServiceStartIndex = localServiceCount + nationalServiceCount;
  specialServices = ServiceFactory.createSpecialServices(
    specialServiceGenerators,
    specialServiceStartIndex
  );

  const customPreferenceEnabledGenerators = new Map<ServiceId, () => boolean>();
  customPreferenceEnabledGenerators.set(cgnServiceId, isCgnActivated);
  const serviceIds = localServices
    .map(localService => localService.service_id)
    .concat(
      nationalServices.map(nationalService => nationalService.service_id),
      specialServices.map(specialService => specialService.service_id)
    );
  servicePreferences = ServiceFactory.createServicePreferences(
    serviceIds,
    customPreferenceEnabledGenerators
  );
};

const getLocalServices = () => {
  const clonedLocalServices: Readonly<ServicePublic>[] = [];
  localServices.forEach(localService =>
    clonedLocalServices.push(Object.assign({}, localService))
  );
  return clonedLocalServices;
};

const getSummaries = (): ReadonlyArray<ServiceSummary> => {
  const services = localServices.concat(nationalServices, specialServices);
  return services.map(
    s =>
      ({
        service_id: s.service_id,
        version: s.version,
        scope: s.service_metadata?.scope
      } as ServiceSummary)
  );
};

export type ServiceSummary = {
  service_id: ServiceId;
  version: number;
  scope?: ServiceScopeEnum;
};

const deleteServices = () => {
  localServices = [];
  nationalServices = [];
  specialServices = [];
  servicePreferences.clear();
};

const getService = (
  serviceId: ServiceId
): Readonly<ServicePublic> | undefined => {
  const localService = localServices.find(
    service => service.service_id === serviceId
  );
  if (localService) {
    return localService;
  }

  const nationalService = nationalServices.find(
    service => service.service_id === serviceId
  );
  if (nationalService) {
    return nationalService;
  }

  return specialServices.find(service => service.service_id === serviceId);
};

const getPreference = (
  serviceId: ServiceId
): Readonly<ServicePreference> | undefined => servicePreferences.get(serviceId);

const updatePreference = (
  serviceId: ServiceId,
  updatedPreference: ServicePreference
): void => {
  const servicePreference = servicePreferences.get(serviceId);
  if (servicePreference) {
    const mergedServicePreference: ServicePreference = {
      ...servicePreference,
      ...updatePreference
    };
    servicePreferences.set(serviceId, mergedServicePreference);
  }
};

export default {
  createServices,
  deleteServices,
  getLocalServices,
  getPreference,
  getService,
  getSummaries,
  updatePreference
};
