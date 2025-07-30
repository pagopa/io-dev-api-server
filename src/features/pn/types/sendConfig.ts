import { Ulid } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";

export const SendConfig = t.type({
  sendAARs: t.array(Ulid),
  sendMessages: t.array(Ulid),
  sendNotifications: t.array(
    t.intersection([
      t.type({}),
      t.partial({
        abstract: t.string,
        acknowledged: t.boolean,
        attachments: t.array(t.union([t.literal("DOC"), t.literal("F24")])),
        cancelled: t.boolean,
        iun: t.string,
        payments: t.array(
          t.union([
            t.literal("EXPIRED"),
            t.literal("FAILED"),
            t.literal("ONGOING"),
            t.literal("PAID"),
            t.literal("REVOKED"),
            t.literal("TOBEPAID"),
            t.literal("UNRELATED")
          ])
        ),
        senderDenomination: t.string,
        subject: t.string,
        timeline: t.array(
          t.union([
            t.literal("ACCEPTED"),
            t.literal("CANCELLED"),
            t.literal("DELIVERED"),
            t.literal("DELIVERING"),
            t.literal("EFFECTIVE_DATE"),
            t.literal("IN_VALIDATION"),
            t.literal("PAID"),
            t.literal("REFUSED"),
            t.literal("UNREACHABLE"),
            t.literal("VIEWED")
          ])
        ),
        userIsRecipient: t.boolean
      })
    ])
  ),
  sendOptInMessage: t.boolean,
  sendMandates: t.array(Ulid)
});

export type SendConfig = t.TypeOf<typeof SendConfig>;
