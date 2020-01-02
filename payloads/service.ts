import { range } from "fp-ts/lib/Array";
import { PaginatedServiceTupleCollection } from "../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServicePublic } from "../generated/definitions/backend/ServicePublic";
import { ScopeEnum, Service } from "../generated/definitions/content/Service";
import { validatePayload } from "../src/utils/validator";
import { IOResponse } from "./response";

export const getService = (serviceId: string): IOResponse<ServicePublic> => {
  const service = {
    available_notification_channels: ["EMAIL", "WEBHOOK"],
    department_name: "dev department name",
    organization_fiscal_code: "00514490010",
    organization_name: "dev organization name",
    service_id: serviceId,
    service_name: `mock service [${serviceId}]`,
    version: 1
  };
  return {
    payload: validatePayload(ServicePublic, service)
  };
};

export const getServices = (
  count: number
): IOResponse<PaginatedServiceTupleCollection> => {
  const payload = {
    items: range(1, count).map(idx => getService(`dev-service_${idx}`).payload),
    page_size: count
  };
  return {
    payload,
    isJson: true
  };
};

export const getServiceMetadata = (
  serviceId: string,
  services: PaginatedServiceTupleCollection
): IOResponse<Service> => {
  const serviceIndex = services.items.findIndex(
    s => s.service_id === serviceId
  );
  // tslint:disable-next-line: no-let
  let serviceScope: ScopeEnum = ScopeEnum.NATIONAL;
  // first half -> LOCAL
  // second half -> NATIONAL
  if (serviceIndex + 1 <= services.items.length * 0.5) {
    serviceScope = ScopeEnum.LOCAL;
  }
  const metaData: Service = {
    scope: serviceScope,
    address: "mock address",
    email: "mock.service@email.com",
    phone: "5555555"
  };
  const serviceMetada = validatePayload(Service, metaData);
  return { payload: serviceMetada, isJson: true };
};
