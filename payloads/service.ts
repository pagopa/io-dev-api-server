import { IOResponse } from "./response";
import { validatePayload } from "../utils/validator";
import { ServicePublic } from "../generated/definitions/backend/ServicePublic";
import { range } from "fp-ts/lib/Array";

export const getService = (service_id: string): IOResponse => {
  const service = {
    available_notification_channels: ["EMAIL", "WEBHOOK"],
    department_name: "dev department name",
    organization_fiscal_code: "00514490010",
    organization_name: "dev organization name",
    service_id,
    service_name: `mock service [${service_id}]`,
    version: 1
  };
  return {
    payload: validatePayload(ServicePublic, service)
  };
};

export const getServices = (count: number): IOResponse => {
  const payload = {
    items: range(1, count).map(idx => getService(`dev-service_${idx}`).payload),
    page_size: count
  };
  return {
    payload,
    isJson: true
  };
};
