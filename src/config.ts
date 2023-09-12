import * as path from "path";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import chalk from "chalk";
import * as E from "fp-ts/lib/Either";
import _ from "lodash";
import { EmailAddress } from "../generated/definitions/backend/EmailAddress";
import { PreferredLanguageEnum } from "../generated/definitions/backend/PreferredLanguage";
import { PushNotificationsContentTypeEnum } from "../generated/definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../generated/definitions/backend/ReminderStatus";
import {
  IoDevServerConfig,
  ProfileAttrs,
  WalletMethodConfig
} from "./types/config";
import { readFileAsJSON } from "./utils/file";

export const staticContentRootPath = "/static_contents";
const root = path.resolve(".");
export const assetsFolder = path.join(root, "assets");
export const configFolder = path.join(root, "config");

const defaultProfileAttrs: ProfileAttrs = {
  name: "Maria Giovanna",
  family_name: "Rossi",
  mobile: "5555555555" as NonEmptyString,
  fiscal_code: "TAMMRA80A41H501I" as FiscalCode,
  email: "maria.giovanna.rossi@email.it" as EmailAddress,
  accepted_tos_version: 4.5 as NonNegativeNumber,
  preferred_languages: [PreferredLanguageEnum.it_IT],
  reminder_status: ReminderStatusEnum.ENABLED,
  push_notifications_content_type: PushNotificationsContentTypeEnum.FULL
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
    responseError: undefined,
    logSAMLRequest: false
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
      getThirdPartyMessageResponseCode: 200
    },
    pnMessageTemplateWrappers: [
      {
        count: 0,
        template: {
          unpaidValidPayments: 360,
          unpaidExpiredPayments: 5,
          paidPayments: 12,
          failedPayments: 7,
          unrelatedPayments: 20,
          isCancelled: false,
          attachmentCount: 2,
          f24Count: 19
        }
      },
      {
        count: 0,
        template: {
          unpaidValidPayments: 1,
          unpaidExpiredPayments: 1,
          paidPayments: 1,
          failedPayments: 1,
          unrelatedPayments: 1,
          isCancelled: false,
          attachmentCount: 3,
          f24Count: 4
        }
      }
    ],
    pnOptInMessage: false,
    withRemoteAttachments: 0,
    paymentsCount: 1,
    paymentInvalidAfterDueDateWithValidDueDateCount: 0,
    paymentInvalidAfterDueDateWithExpiredDueDateCount: 0,
    paymentWithValidDueDateCount: 0,
    paymentWithExpiredDueDateCount: 0,
    medicalCount: 0,
    fci: {
      waitForSignatureCount: 0,
      rejectedCount: 0,
      expiredCount: 0,
      expired90Count: 0,
      waitForQtspCount: 0,
      signedCount: 0,
      canceledCount: 0,
      noSignatureFieldsCount: 0,
      response: {
        getFciResponseCode: 200
      }
    },
    withCTA: false,
    withEUCovidCert: false,
    withValidDueDateCount: 0,
    withInValidDueDateCount: 0,
    // sending 2 messages at minimum to allow for basic pagination
    standardMessageCount: 2,
    archivedMessageCount: 1,
    // atm it has effect only on message flow (pr welcome)
    allowRandomValues: true
  },
  wallet: {
    methods: paymentMethods,
    shuffleAbi: true,
    useLegacyRptIdVerificationSystem: false,
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
    paymentOutCode: 0,
    // IDPay initiatives show in wallet
    idPay: {
      refundCount: 1,
      refundNotConfiguredCount: 0,
      refundUnsubscribedCount: 0,
      refundSuspendedCount: 0,
      discountCount: 1
    }
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
    specialServices: {
      siciliaVola: true,
      cgn: true,
      cdc: true,
      pn: false,
      fci: true
    },
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
    idpay: {
      ibanSize: 3
    },
    lollipop: {
      enabled: false
    },
    fastLogin: {
      sessionTTLinMS: 60000
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
  // eslint-disable-next-line no-console
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
      checkData.left
    )}`
  );
}
