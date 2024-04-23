import { Router } from "express";

export const serviceRouter = Router();

export const SERVICES_PREFIX = "/api/v2";

export const addApiV2Prefix = (path: string) => `${SERVICES_PREFIX}${path}`;
