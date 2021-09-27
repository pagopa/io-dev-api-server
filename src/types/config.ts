import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";

/* profile */
export const ProfileAttrs = t.interface({
  fiscalCode: FiscalCode,
  name: t.string,
  family_name: t.string,
  mobile: NonEmptyString,
  spid_email: EmailAddress,
  email: EmailAddress
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
  citizenPrivative: t.boolean
});
export type WalletMethodConfig = t.TypeOf<typeof WalletMethodConfig>;

/* general */
const HttpResponseCode = t.keyof({
  200: null,
  400: null,
  401: null,
  404: null,
  429: null,
  500: null
});

const IoDevServerConfigR = t.interface({});

const IoDevServerConfigO = t.partial({
  // some attributes of the profile used as citizen
  profile: t.interface({
    attrs: ProfileAttrs,
    authenticationProvider: t.keyof({
      cie: null,
      spid: null
    }),
    firstOnboarding: t.boolean
  }),
  // the global delay applied to all responses (0 means instant response)
  globalDelay: t.number,
  // if true, no login page will be shown (SPID)
  autoLogin: t.boolean,
  messages: t.interface({
    // 200 success with payload
    getMessagesResponseCode: HttpResponseCode,
    // 200 success with payload
    getMessageResponseCode: HttpResponseCode,
    // number of messages containing payment (valid with no due date and invalid after due date)
    paymentsCount: t.number,
    // number of message - invalid after due date - containing a payment and a valid (not expired) due date
    paymentInvalidAfterDueDateWithValidDueDateCount: t.number,
    // number of message - invalid after due date -  containing a payment and a not valid (expired) due date
    paymentInvalidAfterDueDateWithExpiredDueDateCount: t.number,
    // number of message containing a payment and a valid (not expired) due date
    paymentWithValidDueDateCount: t.number,
    // number of message containing a payment and a not valid (expired) due date
    paymentWithExpiredDueDateCount: t.number,
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
  services: t.interface({
    // 200 success with payload
    getServicesResponseCode: HttpResponseCode,
    // 200 success with payload
    getServiceResponseCode: HttpResponseCode,
    // 200 success
    postServicesPreference: HttpResponseCode,
    // 200 success with payload
    getServicesPreference: HttpResponseCode,
    // number of services national
    national: t.number,
    local: t.number,
    includeSiciliaVola: t.boolean
  }),
  wallet: t.interface({
    methods: WalletMethodConfig
  })
});

export const IoDevServerConfig = t.exact(
  t.intersection([IoDevServerConfigR, IoDevServerConfigO], "IoDevServerConfig")
);

export type IoDevServerConfig = t.TypeOf<typeof IoDevServerConfig>;
