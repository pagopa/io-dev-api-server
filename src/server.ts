import { createServer } from "./core/server";
import { IODevelopmentPlugin, IODevelopmentPluginOptions } from "./io-dev";

import { ProfilePluginOptions } from "./routers/profile";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { EmailAddress } from "../generated/definitions/backend/EmailAddress";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { PreferredLanguageEnum } from "../generated/definitions/backend/PreferredLanguage";
import { WalletMethodConfig } from "./routers/walletsV2";

export type IODevelopmentServerOptions = {
  logger: boolean;
} & IODevelopmentPluginOptions;

export const defaultProfileAttrs: ProfilePluginOptions["profile"]["attrs"] = {
  name: "Maria Giovanna",
  family_name: "Rossi",
  mobile: "5555555555" as NonEmptyString,
  fiscal_code: "TAMMRA80A41H501I" as FiscalCode,
  email: "maria.giovanna.rossi@email.it" as EmailAddress,
  accepted_tos_version: 2.4 as NonNegativeNumber,
  preferred_languages: [PreferredLanguageEnum.it_IT]
};

export const paymentMethods: WalletMethodConfig = {
  walletBancomatCount: 0,
  walletCreditCardCount: 1,
  walletCreditCardCoBadgeCount: 0,
  privativeCount: 0,
  satispayCount: 0,
  paypalCount: 0,
  bPayCount: 0,
  citizenSatispay: true,
  citizenBancomatCount: 1,
  citizenBPayCount: 1,
  citizenCreditCardCoBadgeCount: 1,
  citizenPrivative: true,
  citizenPaypal: true
};

export const defaultIODevelopmentOptions: IODevelopmentServerOptions = {
  logger: false,
  global: {
    autoLogin: false
  },
  profile: {
    attrs: defaultProfileAttrs,
    authenticationProvider: "spid",
    firstOnboarding: false
  },
  messages: {
    response: {
      getMessagesResponseCode: 200,
      getMessageResponseCode: 200,
      getMVLMessageResponseCode: 200
    },
    legalCount: 0,
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
    standardMessageCount: 2
  },
  wallet: {
    methods: paymentMethods,
    shuffleAbi: true,
    verificaError: undefined,
    // atm it has no effect (pr welcome)
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
    includeSiciliaVola: false,
    includeCgn: false
  }
};

export type IODevelomentServer = ReturnType<typeof createServer> & {
  loadedConfig: Readonly<IODevelopmentServerOptions>;
};

export function createIODevelopmentServer(
  options = defaultIODevelopmentOptions
): IODevelomentServer {
  const server = createServer({
    logger: options.logger
  });
  server.use(IODevelopmentPlugin, options);
  return { ...server, loadedConfig: options };
}
