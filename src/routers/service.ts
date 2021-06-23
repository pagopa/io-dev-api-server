import { Router } from "express";
import { servicesNumber } from "../global";
import { addHandler } from "../payloads/response";
import { getServices, getServicesTuple } from "../payloads/service";
import { sendFile } from "../utils/file";
import { addApiV1Prefix } from "../utils/strings";
import { publicRouter } from "./public";
export const serviceRouter = Router();

export const services = getServices(servicesNumber);
export const visibleServices = getServicesTuple(services);

addHandler(serviceRouter, "get", addApiV1Prefix("/services"), (_, res) =>
  res.json(visibleServices.payload)
);

addHandler(
  serviceRouter,
  "get",
  addApiV1Prefix("/services/:service_id"),
  (req, res) => {
    const service = services.find(
      item => item.service_id === req.params.service_id
    );
    if (service === undefined) {
      res.sendStatus(404);
      return;
    }
    res.json(service);
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
