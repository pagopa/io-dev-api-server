import { Router } from "express";
import { servicesNumber } from "../global";
import { notFound } from "../payloads/error";
import { addHandler } from "../payloads/response";
import {
  getServices,
  getServicesByScope,
  getServicesTuple
} from "../payloads/service";
import { addApiV1Prefix } from "../utils/strings";
import { loginWithToken } from "../payloads/login";
import { sendFile } from "../utils/file";
import { publicRouter } from "./public";

export const serviceRouter = Router();
export const services = getServices(servicesNumber);
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

/**
 * just for test purposes
 * an html test page to trigger the services webview
 * see https://www.pivotaltracker.com/story/show/177226606
 */
addHandler(publicRouter, "get", "/services_web_view", (req, res) => {
  sendFile("assets/html/services_web_view.html", res);
});
