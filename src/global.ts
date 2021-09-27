import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import * as path from "path";
import { EmailAddress } from "../generated/definitions/backend/EmailAddress";
import {
  IoDevServerConfig,
  ProfileAttrs,
  WalletMethodConfig
} from "./types/config";

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

const paymentMethods: WalletMethodConfig = {
  walletBancomatCount: 1,
  walletCreditCardCount: 1,
  walletCreditCardCoBadgeCount: 0,
  privativeCount: 0,
  satispayCount: 0,
  bPayCount: 0,
  citizenSatispay: true,
  citizenBancomatCount: 3,
  citizenBPayCount: 3,
  citizenCreditCardCoBadgeCount: 3,
  citizenPrivative: true
};

const defaultConfig: Required<IoDevServerConfig> = {
  profile: {
    attrs: defaultProfileAttrs,
    authenticationProvider: "spid",
    firstOnboarding: false
  },
  globalDelay: 0,
  autoLogin: false,
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
  wallet: {
    methods: paymentMethods
  },
  services: {
    getServicesPreference: 200,
    getServicesResponseCode: 200,
    postServicesPreference: 200,
    getServiceResponseCode: 200,
    national: 0,
    local: 1,
    includeSiciliaVola: false
  }
};

export const ioDevServerConfig: Required<IoDevServerConfig> = defaultConfig;
