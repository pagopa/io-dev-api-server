import { Router } from "express";
import { faker } from "@faker-js/faker/locale/it";
import { addHandler } from "../../../payloads/response";
import { getRandomValue } from "../../../utils/random";
import { addApiV1Prefix } from "../../../utils/strings";
import { securedSvRouter } from "./secured";

export const authSvRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/mitvoucher/auth${path}`);

/**
 * Get the mit auth token
 */
addHandler(securedSvRouter, "get", addPrefix("/token"), (_, res) =>
  res.json({
    token: getRandomValue("svAuthToken", faker.datatype.uuid(), "global")
  })
);
