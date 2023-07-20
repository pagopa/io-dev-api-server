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
import {
  createPnService,
  createPnOptInService
} from "../payloads/services/special/pn/factoryPn";
import { createSiciliaVolaService } from "../payloads/services/special/siciliaVola/factorySiciliaVolaService";
import { isCgnActivated } from "../routers/features/cgn";
import { IoDevServerConfig } from "../types/config";
import { ServiceScopeEnum } from "../../generated/definitions/backend/ServiceScope";

export type ServiceSummary = {
  service_id: ServiceId;
  version: number;
  scope?: ServiceScopeEnum;
};

// eslint-disable-next-line functional/no-let
let localServices: ServicePublic[] = [];
// eslint-disable-next-line functional/no-let
let nationalServices: ServicePublic[] = [];
// eslint-disable-next-line functional/no-let
let specialServices: ServicePublic[] = [];
// eslint-disable-next-line functional/no-let
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
  const specialServiceGenerators: Array<[boolean, SpecialServiceGenerator]> = [
    [specialServicesConfig.siciliaVola, createSiciliaVolaService],
    [specialServicesConfig.cgn, createCgnService],
    [specialServicesConfig.cdc, createCdcService],
    [specialServicesConfig.pn, createPnOptInService],
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
  const servicePreferenceSources = localServices
    .map(localService =>
      ServiceFactory.createServicePreferenceSource(localService.service_id)
    )
    .concat(
      nationalServices.map(nationalService =>
        ServiceFactory.createServicePreferenceSource(nationalService.service_id)
      ),
      specialServices.map(specialService =>
        ServiceFactory.createServicePreferenceSource(
          specialService.service_id,
          true
        )
      )
    );
  servicePreferences = ServiceFactory.createServicePreferences(
    servicePreferenceSources,
    customPreferenceEnabledGenerators
  );
};

const deleteServices = () => {
  localServices = [];
  nationalServices = [];
  specialServices = [];
  servicePreferences.clear();
};

const getLocalServices = () => localServices.map(ls => ({ ...ls }));

const getPreference = (
  serviceId: ServiceId
): Readonly<ServicePreference> | undefined => servicePreferences.get(serviceId);

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

const getSummaries = (
  excludeSpecialServices: boolean = false
): ReadonlyArray<ServiceSummary> => {
  const services = [
    ...localServices,
    ...nationalServices,
    ...(excludeSpecialServices ? [] : specialServices)
  ];
  return services.map(
    s =>
      ({
        service_id: s.service_id,
        version: s.version,
        scope: s.service_metadata?.scope
      } as ServiceSummary)
  );
};

const isSpecialService = (serviceId: ServiceId): boolean =>
  specialServices.find(
    specialService => specialService.service_id === serviceId
  ) !== undefined;

const updatePreference = (
  serviceId: ServiceId,
  updatedPreference: ServicePreference
): ServicePreference | undefined => {
  const servicePreference = servicePreferences.get(serviceId);
  if (!servicePreference) {
    return undefined;
  }
  const mergedServicePreference: ServicePreference = {
    ...servicePreference,
    ...updatedPreference
  };
  servicePreferences.set(serviceId, mergedServicePreference);
  return mergedServicePreference;
};

export default {
  createServices,
  deleteServices,
  getLocalServices,
  getPreference,
  getService,
  getSummaries,
  isSpecialService,
  updatePreference
};
