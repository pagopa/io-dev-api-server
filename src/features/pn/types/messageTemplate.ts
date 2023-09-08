import * as t from "io-ts";

export const PNMessageTemplate = t.intersection([
  t.type({
    unpaidValidPayments: t.number,
    unpaidExpiredPayments: t.number,
    paidPayments: t.number,
    failedPayments: t.number,
    unrelatedPayments: t.number,
    attachmentCount: t.number,
    f24Count: t.number
  }),
  t.partial({
    isCancelled: t.boolean
  })
]);
export type PNMessageTemplate = t.TypeOf<typeof PNMessageTemplate>;
