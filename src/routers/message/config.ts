import * as t from "io-ts";

import { HttpResponseCode } from "../../core/server";
import { ProfileFiscalCodeAttr } from "../profile";

export const MessageConfig = t.intersection([
  t.interface({
    // configure some API response error code
    response: t.interface({
      // 200 success with payload
      getMessagesResponseCode: HttpResponseCode,
      // 200 success with payload
      getMessageResponseCode: HttpResponseCode,
      // 200 success with payload
      getMVLMessageResponseCode: HttpResponseCode
    }),
    paymentsCount: t.number,
    legalCount: t.number,
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
    standardMessageCount: t.number,
    allowRandomValues: t.boolean
  }),
  t.partial({
    liveMode: t.interface({
      count: t.number,
      interval: t.number
    })
  })
]);

export const MessagePluginOptions = t.intersection([
  ProfileFiscalCodeAttr,
  t.interface({
    messages: MessageConfig
  })
]);

export type MessagePluginOptions = t.TypeOf<typeof MessagePluginOptions>;
