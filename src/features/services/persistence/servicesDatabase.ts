import { ServiceId } from "../../../../generated/definitions/backend/ServiceId";
import { ServicePreference } from "../../../../generated/definitions/backend/ServicePreference";
import { ServicePublic } from "../../../../generated/definitions/backend/ServicePublic";
import { isCgnActivated } from "../../../routers/features/cgn";
import { IoDevServerConfig } from "../../../types/config";
import { ServiceScopeEnum } from "../../../../generated/definitions/backend/ServiceScope";
import {
  createPnOptInService,
  createPnService
} from "../../pn/services/services";
import { createFciService } from "./services/special/fci-service";
import { cgnServiceId, createCgnService } from "./services/special/cgn-service";
import ServiceFactory, { SpecialServiceGenerator } from "./services/factory";
import { createCdcService } from "./services/special/cdc-service";

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

const createServices = (config: IoDevServerConfig) => {
  const {
    local: localServiceCount,
    national: nationalServiceCount,
    specialServices: specialServicesConfig
  } = config.services;

  localServices = ServiceFactory.createLocalServices(localServiceCount, 0);
  nationalServices = ServiceFactory.createNationalServices(
    nationalServiceCount,
    localServiceCount
  );

  const specialServiceGenerators: Array<[boolean, SpecialServiceGenerator]> = [
    [specialServicesConfig.cgn, createCgnService],
    [specialServicesConfig.cdc, createCdcService],
    [specialServicesConfig.fci, createFciService],
    [specialServicesConfig.pn, createPnOptInService],
    [specialServicesConfig.pn, createPnService]
  ];
  specialServices = ServiceFactory.createSpecialServices(
    specialServiceGenerators,
    localServiceCount + nationalServiceCount
  );

  const customPreferenceEnabledGenerators = new Map<ServiceId, () => boolean>();
  customPreferenceEnabledGenerators.set(cgnServiceId, isCgnActivated);

  const servicePreferenceSources = [
    ...localServices.map(localService =>
      ServiceFactory.createServicePreferenceSource(localService.service_id)
    ),
    ...nationalServices.map(nationalService =>
      ServiceFactory.createServicePreferenceSource(nationalService.service_id)
    ),
    ...specialServices.map(specialService =>
      ServiceFactory.createServicePreferenceSource(
        specialService.service_id,
        true
      )
    )
  ];
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

const getAllServices = () => [
  ...localServices,
  ...nationalServices,
  ...specialServices
];

const getLocalServices = () => localServices.map(ls => ({ ...ls }));
const getNationalServices = () => nationalServices.map(ls => ({ ...ls }));
const getSpecialServices = () => specialServices.map(ls => ({ ...ls }));

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
  return services.map(s => ({
    service_id: s.service_id,
    version: s.version,
    scope: s.service_metadata?.scope
  }));
};

const isSpecialService = (serviceId: ServiceId) =>
  specialServices.some(
    specialService => specialService.service_id === serviceId
  );

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
  getAllServices,
  getLocalServices,
  getNationalServices,
  getSpecialServices,
  getPreference,
  getService,
  getSummaries,
  isSpecialService,
  updatePreference
};
