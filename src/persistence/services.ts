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
  const clonedLocalServices: ServicePublic[] = [];
  localServices.forEach(localService =>
    clonedLocalServices.push(Object.assign({}, localService))
  );
  return clonedLocalServices;
};

const getPreferences = () => servicePreferences;

const getServices = () =>
  localServices.concat(nationalServices, specialServices);

const getVisibleServices = () => {
  const services = getServices();
  const serviceSummary = services.map(s => ({
    service_id: s.service_id,
    version: s.version,
    scope: s.service_metadata?.scope
  }));
  const payload = validatePayload(PaginatedServiceTupleCollection, {
    items: serviceSummary,
    page_size: serviceSummary.length
  });
  return { payload, isJson: true };
};

const deleteServices = () => {
  localServices = [];
  nationalServices = [];
  specialServices = [];
  servicePreferences.clear();
};

export default {
  createServices,
  deleteServices,
  getLocalServices,
  getPreferences,
  getServices,
  getVisibleServices
};
