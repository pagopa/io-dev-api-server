import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as t from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { enumType } from "italia-ts-commons/lib/types";

import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";
import { ImportoEuroCents } from "../../generated/definitions/backend/ImportoEuroCents";
import { Detail_v2Enum } from "../../generated/definitions/backend/PaymentProblemJson";
import { PreferredLanguages } from "../../generated/definitions/backend/PreferredLanguages";

/* profile */
export const ProfileAttrs = t.interface({
  fiscal_code: FiscalCode,
  name: t.string,
  family_name: t.string,
  mobile: NonEmptyString,
  email: EmailAddress,
  accepted_tos_version: NonNegativeNumber,
  preferred_languages: PreferredLanguages
});
export type ProfileAttrs = t.TypeOf<typeof ProfileAttrs>;

/* wallet */
export const WalletMethodConfig = t.interface({
  // bancomats enrolled
  walletBancomatCount: t.number,
  // creditcards enrolled
  walletCreditCardCount: t.number,
  // creditcards-cobadge enrolled
  walletCreditCardCoBadgeCount: t.number,
  // privative enrolled
  privativeCount: t.number,
  // satispay enrolled
  satispayCount: t.number,
  // paypal enrolled
  paypalCount: t.number,
  // bancomat pay enrolled
  bPayCount: t.number,
  // bancomat owned by the citizen (shown when he/she search about them)
  citizenBancomatCount: t.number,
  // bancomat pay owned by the citizen (shown when he/she search about them)
  citizenBPayCount: t.number,
  // creditcards-cobadge pay owned by the citizen (shown when he/she search about them)
  citizenCreditCardCoBadgeCount: t.number,
  // if true -> citizen has satispay (when he/she search about it)
  citizenSatispay: t.boolean,
  // if true -> citizen has privative cards (when he/she search about it)
  citizenPrivative: t.boolean,
  // if true -> citizen has paypal (when he/she search about it)
  citizenPaypal: t.boolean
});
export type WalletMethodConfig = t.TypeOf<typeof WalletMethodConfig>;

export const PaymentConfig = t.interface({
  // integer including decimals - ie: 22.22 = 2222
  amount: ImportoEuroCents,
  pspFeeAmount: t.number
});
export type PaymentConfig = t.TypeOf<typeof PaymentConfig>;

/* general http response codes */
const HttpResponseCode = t.union([
  t.literal(200),
  t.literal(400),
  t.literal(401),
  t.literal(404),
  t.literal(429),
  t.literal(500)
]);

const AllowRandomValue = t.interface({ allowRandomValues: t.boolean });

const LiveModeMessages = t.interface({
  // interval between updates in millis
  interval: t.number,
  // number of new messages
  count: t.number
});
export type LiveModeMessages = t.Type<typeof LiveModeMessages>;

export const IoDevServerConfig = t.interface({
  global: t.intersection([
    t.interface({
      // the global delay applied to all responses (0 means instant response)
      delay: t.number,
      // if true, no login page will be shown (SPID)
      autoLogin: t.boolean,
      // if false fixed values will be used
      allowRandomValues: t.boolean
    }),
    AllowRandomValue
  ]),
  // some attributes of the profile used as citizen
  profile: t.intersection([
    t.interface({
      attrs: ProfileAttrs,
      authenticationProvider: t.keyof({
        cie: null,
        spid: null
      }),
      firstOnboarding: t.boolean
    }),
    AllowRandomValue
  ]),
  messages: t.intersection([
    t.interface({
      // configure some API response error code
      response: t.interface({
        // 200 success with payload
        getMessagesResponseCode: HttpResponseCode,
        // 200 success with payload
        getMessageResponseCode: HttpResponseCode
        // number of messages containing payment (valid with no due date and invalid after due date)
      }),
      paymentsCount: t.number,
      // number of message - invalid after due date - containing a payment and a valid (not expired) due date
      paymentInvalidAfterDueDateWithValidDueDateCount: t.number,
      // number of message - invalid after due date -  containing a payment and a not valid (expired) due date
      paymentInvalidAfterDueDateWithExpiredDueDateCount: t.number,
      // number of message containing a payment and a valid (not expired) due date
      paymentWithValidDueDateCount: t.number,
      // number of message containing a payment and a not valid (expired) due date
      paymentWithExpiredDueDateCount: t.number,
      // whether we dynamically create new messages or not
      // number of medical messages
      medicalCount: t.number,
      // if true, messages (all available) with nested CTA will be included
      withCTA: t.boolean,
      // if true, messages (all available) with EUCovidCert will be included
      withEUCovidCert: t.boolean,
      // with valid due date
      withValidDueDateCount: t.number,
      // with invalid (expired) due date
      withInValidDueDateCount: t.number,
      standardMessageCount: t.number
    }),
    AllowRandomValue,
    t.partial({
      liveMode: LiveModeMessages
    })
  ]),
  services: t.intersection([
    t.interface({
      // configure some API response error code
      response: t.interface({
        // 200 success with payload
        getServicesResponseCode: HttpResponseCode,
        // 200 success with payload
        getServiceResponseCode: HttpResponseCode,
        // 200 success
        postServicesPreference: HttpResponseCode,
        // 200 success with payload
        getServicesPreference: HttpResponseCode
      }),
      // number of services national
      national: t.number,
      // number of services local
      local: t.number,
      includeSiciliaVola: t.boolean
    }),
    AllowRandomValue
  ]),
  wallet: t.intersection([
    t.interface({
      // if false fixed values will be used
      allowRandomValues: t.boolean,
      methods: WalletMethodConfig,
      shuffleAbi: t.boolean
    }),
    t.partial({
      // the outcode returned at the end of credit card onboarding
      onboardingCreditCardOutCode: t.number,
      // if defined attiva will serve the given error
      attivaError: enumType<Detail_v2Enum>(Detail_v2Enum, "detail_v2"),
      // if verifica attiva will serve the given error
      verificaError: enumType<Detail_v2Enum>(Detail_v2Enum, "detail_v2"),
      // configure the dummy payment
      payment: PaymentConfig
    }),

    AllowRandomValue
  ])
});
export type AllorRandomValueKeys = keyof IoDevServerConfig;
export type IoDevServerConfig = t.TypeOf<typeof IoDevServerConfig>;
