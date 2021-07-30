import { Router } from "express";
import { authSvRouter } from "./auth";
import { securedSvRouter } from "./secured";
import { unsecuredSvRouter } from "./unsecured";

export const svRouter = Router();

svRouter.use(securedSvRouter, authSvRouter, unsecuredSvRouter);
