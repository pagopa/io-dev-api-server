import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import _ from "lodash";
import * as path from "path";
import { EmailAddress } from "../generated/definitions/backend/EmailAddress";
import { PreferredLanguageEnum } from "../generated/definitions/backend/PreferredLanguage";
import {
  IoDevServerConfig,
  ProfileAttrs,
  WalletMethodConfig
} from "./types/config";
import { readFileAsJSON } from "./utils/file";

export const staticContentRootPath = "/static_contents";
const root = path.resolve(".");
export const assetsFolder = root + "/assets";
export const configFolder = root + "/config";

const defaultProfileAttrs: ProfileAttrs = {
  name: "Maria Giovanna",
  family_name: "Rossi",
  mobile: "5555555555" as NonEmptyString,
  fiscal_code: "TAMMRA80A41H501I" as FiscalCode,
  email: "maria.giovanna.rossi@email.it" as EmailAddress,
  accepted_tos_version: 2.4 as NonNegativeNumber,
  preferred_languages: [PreferredLanguageEnum.it_IT]
};

const paymentMethods: WalletMethodConfig = {
  walletBancomatCount: 1,
  walletCreditCardCount: 2,
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

const defaultConfig: IoDevServerConfig = {
  global: {
    delay: 0,
    autoLogin: false,
    allowRandomValues: true
  },
  profile: {
    attrs: defaultProfileAttrs,
    authenticationProvider: "spid",
    firstOnboarding: false,
    allowRandomValues: true
  },
  messages: {
    response: {
      getMessagesResponseCode: 200,
      getMessageResponseCode: 200
    },
    paymentsCount: 0,
    paymentInvalidAfterDueDateWithValidDueDateCount: 0,
    paymentInvalidAfterDueDateWithExpiredDueDateCount: 0,
    paymentWithValidDueDateCount: 0,
    paymentWithExpiredDueDateCount: 0,
    medicalCount: 0,
    withCTA: false,
    withEUCovidCert: false,
    withValidDueDateCount: 0,
    withInValidDueDateCount: 0,
    standardMessageCount: 0,
    allowRandomValues: false
  },
  wallet: {
    methods: paymentMethods,
    shuffleAbi: false,
    verificaError: undefined,
    attivaError: undefined,
    allowRandomValues: true
  },
  services: {
    response: {
      getServicesPreference: 200,
      getServicesResponseCode: 200,
      postServicesPreference: 200,
      getServiceResponseCode: 200
    },
    national: 0,
    local: 0,
    includeSiciliaVola: true,
    allowRandomValues: true
  }
};
/**
 * set your config file you want to load and apply
 * config file should be included in "config" directory
 */
const customConfigFile = "config.json";
const customConfig =
  readFileAsJSON(`${configFolder}/${customConfigFile}`) ?? {};
export const ioDevServerConfig: typeof defaultConfig = _.merge(
  defaultConfig,
  customConfig
);
const checkData = IoDevServerConfig.decode(ioDevServerConfig);
if (checkData.isLeft()) {
  throw new Error(
    `your custom config file ${customConfig} contains some invalid data:\n${readableReport(
      checkData.value
    )}`
  );
}
