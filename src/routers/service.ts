import { Router } from "express";
import { installHandler } from "../payloads/response";
import { addApiV1Prefix } from "../utils/strings";
import { notFound } from "../payloads/error";
import { services, servicesTuple } from "./message";

export const serviceRouter = Router();

installHandler(
  serviceRouter,
  "get",
  addApiV1Prefix("/services"),
  () => servicesTuple
);

installHandler(
  serviceRouter,
  "get",
  addApiV1Prefix("/services/:service_id"),

  // return a mock service with the same requested id (always found!)
  (req) => {
    const service = services.find(
      (item) => item.service_id === req.params.service_id
    );

    return { payload: service || notFound.payload };
  }
);
