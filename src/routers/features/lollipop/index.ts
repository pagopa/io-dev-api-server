/**
 * this router serves lollipop API
 */

import { Router } from "express";
import { addHandler } from "../../../payloads/response";
import { getAssertionRef } from "../../../persistence/lollipop";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";

export const lollipopRouter = Router();

addHandler(
  lollipopRouter,
  "post",
  "/first-lollipop/sign",
  lollipopMiddleware((req, res) => {
    res.send({ response: getAssertionRef() });
  })
);
