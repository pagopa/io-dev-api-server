import { Router } from "express";
import { notFound } from "../payloads/error";
import { addHandler } from "../payloads/response";
import {
  getServices,
  getServicesByScope,
  getServicesTuple
} from "../payloads/service";
import { addApiV1Prefix } from "../utils/strings";

export const serviceRouter = Router();
export const services = getServices(10);
export const visibleServices = getServicesTuple(services);
export const servicesByScope = getServicesByScope(services);

addHandler(serviceRouter, "get", addApiV1Prefix("/services"), (_, res) =>
  res.json(visibleServices.payload)
);

addHandler(
  serviceRouter,
  "get",
  addApiV1Prefix("/services/:service_id"),

  // return a mock service with the same requested id (always found!)
  (req, res) => {
    const service = services.find(
      item => item.service_id === req.params.service_id
    );
    res.json(service || notFound.payload);
  }
);
