import { range } from "fp-ts/lib/Array";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { DepartmentName } from "../../generated/definitions/backend/DepartmentName";
import { OrganizationName } from "../../generated/definitions/backend/OrganizationName";
import { PaginatedServiceTupleCollection } from "../../generated/definitions/backend/PaginatedServiceTupleCollection";
import { ServiceId } from "../../generated/definitions/backend/ServiceId";
import { ServiceName } from "../../generated/definitions/backend/ServiceName";
import { ServicePublic } from "../../generated/definitions/backend/ServicePublic";
import {
  ScopeEnum,
  Service
} from "../../generated/definitions/content/Service";
import { ServicesByScope } from "../../generated/definitions/content/ServicesByScope";
import { validatePayload } from "../utils/validator";
import { paymentData } from "./payment";
import { IOResponse } from "./response";

export const getService = (serviceId: string): ServicePublic => {
  const service = {
    department_name: "dev department name" as DepartmentName,
    organization_fiscal_code: "00514490010" as OrganizationFiscalCode,
    organization_name: "dev organization name" as OrganizationName,
    service_id: serviceId,
    service_name: `mock service [${serviceId}]` as ServiceName,
    version: 1
  };
  return validatePayload(ServicePublic, service);
};

export const getServices = (count: number): readonly ServicePublic[] => {
  return range(1, count).map((idx: number) => {
    return {
      service_id: `0${idx}` as ServiceId,
      service_name: `servizio ${idx}` as ServiceName,
      organization_name: `ente 1` as OrganizationName,
      department_name: "dipartimento1" as DepartmentName,
      organization_fiscal_code: paymentData.organizationFiscalCode,
      version: 3
    };
  });
};

export const getServicesTuple = (
  services: readonly ServicePublic[]
): IOResponse<PaginatedServiceTupleCollection> => {
  const items = services.map(s => {
    return {
      service_id: s.service_id,
      version: s.version
    };
  });
  const payload = validatePayload(PaginatedServiceTupleCollection, {
    items,
    page_size: items.length
  });
  return { payload, isJson: true };
};

export const getServicesByScope = (
  services: readonly ServicePublic[]
): IOResponse<ServicesByScope> => {
  // first half -> LOCAL
  // second half -> NATIONAL
  const servicesByScope = { LOCAL: Array<string>(), NATIONAL: Array<string>() };
  services.forEach((s, idx) => {
    if (idx + 1 <= services.length / 2) {
      servicesByScope.LOCAL.push(s.service_id);
    } else {
      servicesByScope.NATIONAL.push(s.service_id);
    }
  });
  return {
    payload: validatePayload(ServicesByScope, servicesByScope),
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
  if (serviceIndex + 1 <= services.items.length / 2) {
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
