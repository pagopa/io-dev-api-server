import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import chalk from "chalk";
import * as E from "fp-ts/lib/Either";
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
  accepted_tos_version: 4.0 as NonNegativeNumber,
  preferred_languages: [PreferredLanguageEnum.it_IT]
};

const paymentMethods: WalletMethodConfig = {
  walletBancomatCount: 0,
  walletCreditCardCount: 1,
  walletCreditCardCoBadgeCount: 0,
  privativeCount: 0,
  satispayCount: 0,
  paypalCount: 1,
  bPayCount: 1,
  citizenSatispay: true,
  citizenBancomatCount: 1,
  citizenBPayCount: 1,
  citizenCreditCardCoBadgeCount: 1,
  citizenPrivative: true,
  citizenPaypal: true
};

/**
 * default config to setup dev-server
 * warning: you should not edit this file (neither commit). Instead you should add or edit the json config file (see 'config' folder)
 */
const defaultConfig: IoDevServerConfig = {
  global: {
    delay: 0,
    autoLogin: false,
    allowRandomValues: true,
    responseError: undefined
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
      getMessageResponseCode: 200,
      getMVLMessageResponseCode: 200
    },
    legalCount: 0,
    paymentsCount: 1,
    paymentInvalidAfterDueDateWithValidDueDateCount: 0,
    paymentInvalidAfterDueDateWithExpiredDueDateCount: 0,
    paymentWithValidDueDateCount: 0,
    paymentWithExpiredDueDateCount: 0,
    medicalCount: 0,
    withCTA: false,
    withEUCovidCert: false,
    withValidDueDateCount: 0,
    withInValidDueDateCount: 0,
    // sending 2 messages at minimum to allow for basic pagination
    standardMessageCount: 2,
    archivedMessageCount: 1,
    // atm it has effect only on legal message flow (pr welcome)
    allowRandomValues: true
  },
  wallet: {
    methods: paymentMethods,
    shuffleAbi: true,
    verificaError: undefined,
    attivaError: undefined,
    // atm it has no effect (pr welcome)
    allowRandomValues: true,
    payment: undefined,
    // success (0 outcome code)
    onboardingCreditCardOutCode: 0,
    // success (0 outcome code)
    onboardingPaypalOutCode: 0,
    // success (0 outcome code)
    paymentOutCode: 0
  },
  services: {
    response: {
      getServicesPreference: 200,
      getServicesResponseCode: 200,
      postServicesPreference: 200,
      getServiceResponseCode: 200
    },
    national: 5,
    local: 5,
    includeSiciliaVola: true,
    includeCgn: true,
    includeCdc: true,
    // it has partially effect (pr welcome)
    allowRandomValues: true
  },
  features: {
    bonus: {
      cgn: {
        isCgnEligible: true,
        isEycaEligible: true,
        allowRandomValues: true
      }
    },
    allowRandomValues: true
  }
};
/**
 * set your config file you want to load and apply
 * config file should be included in "config" directory
 */
const customConfigFile = "config.json";
const customConfig =
  readFileAsJSON(`${configFolder}/${customConfigFile}`) ?? undefined;
if (customConfig !== undefined) {
  console.log(
    chalk.bgGreenBright(
      `successfully loaded custom config file: ${customConfigFile}`
    )
  );
}

export const ioDevServerConfig: typeof defaultConfig = _.merge(
  defaultConfig,
  customConfig
);
const checkData = IoDevServerConfig.decode(ioDevServerConfig);
if (E.isLeft(checkData)) {
  throw new Error(
    `your custom config file ${customConfig} contains some invalid data:\n${readableReport(
      checkData.value
    )}`
  );
}
