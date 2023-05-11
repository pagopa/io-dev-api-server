import {
  NonNegativeNumber,
  WithinRangeInteger,
  WithinRangeNumber
} from "@pagopa/ts-commons/lib/numbers";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";
import { ImportoEuroCents } from "../../generated/definitions/backend/ImportoEuroCents";
import { Detail_v2Enum } from "../../generated/definitions/backend/PaymentProblemJson";
import { PreferredLanguages } from "../../generated/definitions/backend/PreferredLanguages";
import { PushNotificationsContentType } from "../../generated/definitions/backend/PushNotificationsContentType";
import { ReminderStatus } from "../../generated/definitions/backend/ReminderStatus";

/* profile */
export const ProfileAttrs = t.intersection([
  t.interface({
    fiscal_code: FiscalCode,
    name: t.string,
    family_name: t.string,
    mobile: NonEmptyString,
    email: EmailAddress,
    accepted_tos_version: NonNegativeNumber,
    preferred_languages: PreferredLanguages
  }),
  t.partial({
    reminder_status: ReminderStatus,
    push_notifications_content_type: PushNotificationsContentType
  })
]);

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

const ErrorCodes = WithinRangeInteger(400, 600);
export type ErrorCodes = t.TypeOf<typeof ErrorCodes>;
const responseError = t.interface({
  // the probability that server will response with an error
  chance: WithinRangeNumber(0, 1),
  // a bucket of error codes. If the server will response with an error, a random one will be picked
  codes: t.readonlyArray(ErrorCodes)
});

export const IoDevServerConfig = t.interface({
  global: t.intersection([
    t.interface({
      // the global delay applied to all responses (0 means instant response)
      delay: t.number,
      // if true, no login page will be shown (SPID)
      autoLogin: t.boolean,
      // if false fixed values will be used
      allowRandomValues: t.boolean,
      // if true, logs the lollipop parameters generated during a login request
      logSAMLRequest: t.boolean
    }),
    AllowRandomValue,
    t.partial({
      // the server will response with an error code on every request
      // with a change and code as defined
      responseError
    })
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
        getMessageResponseCode: HttpResponseCode,
        // 200 success with payload
        getMVLMessageResponseCode: HttpResponseCode,
        // 200 success with payload
        getThirdPartyMessageResponseCode: HttpResponseCode
      }),
      paymentsCount: t.number,
      legalCount: t.number,
      // number of messages coming from PN (aka Piattaforma Notifiche)
      pnCount: t.number,
      // number of messages with remote attachments
      withRemoteAttachments: t.number,
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
      // number of fci messages
      fci: t.interface({
        waitForSignatureCount: t.number,
        rejectedCount: t.number,
        expiredCount: t.number,
        expired90Count: t.number,
        waitForQtspCount: t.number,
        signedCount: t.number,
        noSignatureFieldsCount: t.number
      }),
      // if true, messages (all available) with nested CTA will be included
      withCTA: t.boolean,
      // if true, messages (all available) with EUCovidCert will be included
      withEUCovidCert: t.boolean,
      // with valid due date
      withValidDueDateCount: t.number,
      // with invalid (expired) due date
      withInValidDueDateCount: t.number,
      standardMessageCount: t.number,
      archivedMessageCount: t.number
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
      includeSiciliaVola: t.boolean,
      includeCgn: t.boolean,
      includeCdc: t.boolean,
      includePn: t.boolean,
      includeFci: t.boolean
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
      // the outcode returned at the end of paypal onboarding
      onboardingPaypalOutCode: t.number,
      // the outcode returned at the end of a payment
      paymentOutCode: t.number,
      // if defined attiva will serve the given error
      attivaError: enumType<Detail_v2Enum>(Detail_v2Enum, "detail_v2"),
      // if verifica attiva will serve the given error
      verificaError: enumType<Detail_v2Enum>(Detail_v2Enum, "detail_v2"),
      // configure the dummy payment
      payment: PaymentConfig
    }),

    AllowRandomValue
  ]),
  features: t.intersection([
    t.interface({
      bonus: t.interface({
        // defines the special configuration for cgn eligibility
        cgn: t.intersection([
          t.interface({
            // if true the user is eligible to the CGN
            isCgnEligible: t.boolean,
            // if true the user is eligible to the EYCA related activation
            isEycaEligible: t.boolean
          }),
          AllowRandomValue
        ])
      }),
      idpay: t.interface({
        // The size of the IBAN list to generate
        ibanSize: t.number
      })
    }),
    AllowRandomValue
  ])
});
export type AllorRandomValueKeys = keyof IoDevServerConfig;
export type IoDevServerConfig = t.TypeOf<typeof IoDevServerConfig>;
