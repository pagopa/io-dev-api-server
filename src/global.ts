import { FiscalCode } from "italia-ts-commons/lib/strings";
import * as path from "path";
import { IoDevServerConfig, ProfileAttrs } from "./types/config";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { EmailAddress } from "../generated/definitions/backend/EmailAddress";

export const staticContentRootPath = "/static_contents";
export const assetsFolder = path.resolve(".") + "/assets";
export const shouldShuffle = false;

const defaultProfileAttrs: ProfileAttrs = {
  name: "Maria Giovanna",
  family_name: "Rossi",
  mobile: "5555555555" as NonEmptyString,
  fiscalCode: "TAMMRA80A41H501I" as FiscalCode,
  spid_email: "maria.giovanna.rossi@spid-email.it" as EmailAddress,
  email: "maria.giovanna.rossi@email.it" as EmailAddress
};
const defaultConfig: IoDevServerConfig = {
  profileAttrs: defaultProfileAttrs,
  globalDelay: 0,
  servicesCount: 15
};

export const ioDevServerConfig: IoDevServerConfig = defaultConfig;
