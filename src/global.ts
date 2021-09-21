import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import * as path from "path";
import { EmailAddress } from "../generated/definitions/backend/EmailAddress";
import { IoDevServerConfig, ProfileAttrs } from "./types/config";
import * as t from "io-ts";

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
const defaultConfig: Required<IoDevServerConfig> = {
  profileAttrs: defaultProfileAttrs,
  globalDelay: 0,
  messages: {
    paymentsCount: 0,
    paymentInvalidAfterDueDateWithValidDueDateCount: 0,
    paymentInvalidAfterDueDateWithExpiredDueDateCount: 0,
    paymentWithValidDueDateCount: 0,
    paymentWithExpiredDueDateCount: 0,
    medicalCount: 0,
    withCTA: false,
    withEUCovidCert: false,
    withValidDueDateCount: 0,
    withInValidDueDateCount: 1,
    standardMessageCount: 0
  },
  services: {
    servicesCount: 15
  }
};

export const ioDevServerConfig: Required<IoDevServerConfig> = defaultConfig;
