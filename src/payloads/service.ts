import { range } from "fp-ts/lib/Array";
import { PaginatedServiceTupleCollection } from "../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import {
  ScopeEnum,
  Service
} from "../../generated/definitions/content/Service";
import { validatePayload } from "../utils/validator";
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
  const aggregation = 3;
  // services belong to the same organization for blocks of `aggregation` size
  // tslint:disable-next-line: no-let
  let organizationCount = 0;
  const payload = {
    items: range(1, count).map(idx => {
      const service = getService(`dev-service_${idx}`).payload;
      const index = idx - 1;
      organizationCount =
        index !== 0 && index % aggregation === 0
          ? organizationCount + 1
          : organizationCount;
      // first half have organization_fiscal_code === organizationFiscalCodes[0]
      // second half have organization_fiscal_code === organizationFiscalCodes[1]
      return {
        ...service,
        organization_fiscal_code: `${organizationCount + 1}`.padStart(11, "0"),
        organization_name: `organization name_${organizationCount + 1}`
      };
    }),
    page_size: count
  };
  return {
    payload: validatePayload(PaginatedServiceTupleCollection, payload),
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
  return { payload: validatePayload(Service, metaData), isJson: true };
};
