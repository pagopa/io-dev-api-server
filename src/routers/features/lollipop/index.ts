/**
 * this router serves lollipop API
 */

import { Router } from "express";
import { addHandler } from "../../../payloads/response";
import { getAssertionRef } from "../../../persistence/lollipop";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import { addApiIdentityV1Prefix } from "../../../utils/strings";

export const lollipopRouter = Router();

const handlePostLollipopSign = lollipopMiddleware((_req, res) => {
  res.send({ response: getAssertionRef() });
});

addHandler(
  lollipopRouter,
  "post",
  "/first-lollipop/sign",
  handlePostLollipopSign
);
addHandler(
  lollipopRouter,
  "post",
  addApiIdentityV1Prefix("/first-lollipop/sign"),
  handlePostLollipopSign
);
