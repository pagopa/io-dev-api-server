import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";

export const ProfileAttrs = t.interface({
  fiscalCode: FiscalCode,
  name: t.string,
  family_name: t.string,
  mobile: NonEmptyString,
  spid_email: EmailAddress,
  email: EmailAddress
});
export type ProfileAttrs = t.TypeOf<typeof ProfileAttrs>;

/* messages */
const MessagesResponseCode = t.keyof({
  200: null,
  400: null,
  401: null,
  404: null,
  429: null,
  500: null
});

const IoDevServerConfigR = t.interface({});

const IoDevServerConfigO = t.partial({
  // some attributes of the profile used as citized
  profileAttrs: ProfileAttrs,
  // the global delay applied to all responses (0 means immediately response)
  globalDelay: t.number,
  services: t.interface({
    // number of services national
    national: t.number,
    local: t.number,
    includeSiciliaVola: t.boolean
  }),
  messages: t.interface({
    // 200 success with payload
    getMessagesResponseCode: MessagesResponseCode,
    // 200 success with payload
    getMessageResponseCode: MessagesResponseCode,
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
  })
});

export const IoDevServerConfig = t.exact(
  t.intersection([IoDevServerConfigR, IoDevServerConfigO], "IoDevServerConfig")
);

export type IoDevServerConfig = t.TypeOf<typeof IoDevServerConfig>;
