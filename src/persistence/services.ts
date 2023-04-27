import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import { IoDevServerConfig } from "../types/config";

let localServices: ServicePublic[] = [];
let nationalServices: ServicePublic[] = [];

const createServices = (customConfig: IoDevServerConfig): Array<ServicePublic> => {
  const localServiceCount = customConfig.services.local;
  const nationalServiceCount = customConfig.services.national;
  
  return [];
}