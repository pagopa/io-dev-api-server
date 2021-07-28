import { Router } from "express";
import { assetsFolder } from "../../../../global";
import { getVouchersBeneficiary } from "../../../../payloads/features/siciliaVola";
import { addHandler } from "../../../../payloads/response";
import { readFileAsJSON } from "../../../../utils/file";
import { addApiV1Prefix } from "../../../../utils/strings";

export const securedSvRouter = Router();

const addPrefix = (path: string) =>
  addApiV1Prefix(`/mitvoucher/data/rest/secured${path}`);

/**
 * Get the states list
 */
addHandler(
  securedSvRouter,
  "post",
  addPrefix("/beneficiario/ricercaVoucher"),
  (_, res) => res.json(getVouchersBeneficiary(5))
);
