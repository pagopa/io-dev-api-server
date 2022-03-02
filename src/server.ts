import { createServer, Server } from "./core/server";

import { IODevelopmentPlugin, IODevelopmentPluginOptions } from "./io-dev";

import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { EmailAddress } from "../generated/definitions/backend/EmailAddress";
import { PreferredLanguageEnum } from "../generated/definitions/backend/PreferredLanguage";
import { ProfilePluginOptions } from "./routers/profile";
import { WalletMethodConfig } from "./routers/walletsV2";

import bodyParser from "body-parser";
import morgan from "morgan";
import { errorMiddleware, ResponseError } from "./middleware/errorMiddleware";

export type IODevelopmentServerOptions = {
  logger: boolean;
  responseError?: ResponseError;
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

// todo: add server key
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
    standardMessageCount: 2,
    allowRandomValues: false
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
    paymentOutCode: 0,
    allowRandomValues: false
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
    includeCgn: false,
    allowRandomValues: false
  }
};

export type IODevelomentServer = Server & {
  loadedConfig: Readonly<IODevelopmentServerOptions>;
};

export function createIODevelopmentServer(
  options = defaultIODevelopmentOptions
): IODevelomentServer {
  const server = createServer();

  server.useExpressInstance(async app => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    if (options.logger) {
      app.use(
        morgan(
          ":date[iso] :method :url :status :res[content-length] - :response-time ms"
        )
      );
    }
    if (options.responseError) {
      app.use(errorMiddleware(options.responseError));
    }
  });

  server.use(IODevelopmentPlugin, options);
  return { ...server, loadedConfig: options };
}
