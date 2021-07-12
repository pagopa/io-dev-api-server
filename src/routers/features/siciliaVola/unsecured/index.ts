import { Router } from "express";
import { addHandler } from "../../../../payloads/response";
import { addApiV1Prefix } from "../../../../utils/strings";
import { serviceRouter, visibleServices } from "../../../service";

export const unsecuredSvRouter = Router();

const addPrefix = (path: string) =>
  addApiV1Prefix(`/sv/rest/unsecured/${path}`);

addHandler(serviceRouter, "get", addPrefix("/statiUE"), (_, res) =>
  res.json([
    {
      id: 1,
      descrizione: "AUSTRIA",
      iso: "AUT"
    },
    {
      id: 2,
      descrizione: "BELGIO",
      iso: "BEL"
    }
  ])
);
