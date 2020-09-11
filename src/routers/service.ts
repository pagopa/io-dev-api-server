import { Router } from "express";
import { notFound } from "../payloads/error";
import { installHandler } from "../payloads/response";
import {
  getServices,
  getServicesByScope,
  getServicesTuple
} from "../payloads/service";
import { addApiV1Prefix } from "../utils/strings";

export const serviceRouter = Router();
export const services = getServices(5);
export const visibleServices = getServicesTuple(services);
export const servicesByScope = getServicesByScope(services);

installHandler(
  serviceRouter,
  "get",
  addApiV1Prefix("/services"),
  () => visibleServices
);

installHandler(
  serviceRouter,
  "get",
  addApiV1Prefix("/services/:service_id"),

  // return a mock service with the same requested id (always found!)
  req => {
    const service = services.find(
      item => item.service_id === req.params.service_id
    );

    return { payload: service || notFound.payload };
  }
);
