import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { SpecialServiceGenerator, createLocalServices, createNationalServices, createSpecialServices } from "../payloads/services/factory";
import { createCdcService } from "../payloads/services/special/cdc/factoryCDCService";
import { createCgnService } from "../payloads/services/special/cgn/factoryCGNService";
import { createFciService } from "../payloads/services/special/fci/factoryFCIService";
import { createPnService } from "../payloads/services/special/pn/factoryPn";
import { createSiciliaVolaService } from "../payloads/services/special/siciliaVola/factorySiciliaVolaService";
import { IoDevServerConfig } from "../types/config";

let localServices: ServicePublic[] = [];
let nationalServices: ServicePublic[] = [];
let specialServices: ServicePublic[] = [];

const createServices = (customConfig: IoDevServerConfig): Array<ServicePublic> => {
  const localServiceCount = customConfig.services.local;
  localServices = createLocalServices(localServiceCount, 0);

  const nationalServiceCount = customConfig.services.national;
  nationalServices = createNationalServices(nationalServiceCount, localServiceCount);

  const specialServicesConfig = customConfig.services.specialServices;
  const specialServiceGenerators: [boolean, SpecialServiceGenerator][] = [
    [specialServicesConfig.siciliaVola, createSiciliaVolaService],
    [specialServicesConfig.cgn, createCgnService],
    [specialServicesConfig.cdc, createCdcService],
    [specialServicesConfig.pn, createPnService],
    [specialServicesConfig.fci, createFciService]
  ];
  const specialServiceStartIndex = localServiceCount + nationalServiceCount;
  specialServices = createSpecialServices(specialServiceGenerators, specialServiceStartIndex);

  //const visibleServices = getServicesTuple(services);
  //const servicesPreferences = getServicesPreferences(services);
  
  return [];
}

const allServices = () => localServices.concat(nationalServices).concat(specialServices);

export default {
  allServices,
  createServices
}