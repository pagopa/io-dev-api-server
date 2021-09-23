import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import * as path from "path";
import { EmailAddress } from "../generated/definitions/backend/EmailAddress";
import { IoDevServerConfig, ProfileAttrs } from "./types/config";

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
    getMessagesResponseCode: 200,
    getMessageResponseCode: 200,
    paymentsCount: 2,
    paymentInvalidAfterDueDateWithValidDueDateCount: 0,
    paymentInvalidAfterDueDateWithExpiredDueDateCount: 0,
    paymentWithValidDueDateCount: 0,
    paymentWithExpiredDueDateCount: 0,
    medicalCount: 0,
    withCTA: false,
    withEUCovidCert: false,
    withValidDueDateCount: 0,
    withInValidDueDateCount: 0,
    standardMessageCount: 0
  },
  services: {
    national: 0,
    local: 1,
    includeSiciliaVola: false
  }
};

export const ioDevServerConfig: Required<IoDevServerConfig> = defaultConfig;
