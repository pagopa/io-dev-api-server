// return the T&C as a HTML string
import { installCustomHandler } from "../../../payloads/response";
import { addBPDPrefix } from "./index";
import { Router } from "express";
import { assetsFolder } from "../../../global";
import { listDir } from "../../../utils/file";

export const bpdAward = Router();

installCustomHandler(
  bpdAward,
  "get",
  addBPDPrefix("/award-periods"),
  (_, res) => {
    const files = listDir(assetsFolder + "/bpd/award");
    console.log(files);
    res.sendStatus(200);
  }
);
