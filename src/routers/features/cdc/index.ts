import { Router } from "express";
import { cdcBonusRequestRouter } from "./bonusRequest";

export const cdcRouter = Router();

cdcRouter.use(cdcBonusRequestRouter);
