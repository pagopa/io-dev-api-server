import * as t from "io-ts";

export const PNMessageTemplate = t.type({
  unpaidValidPayments: t.number,
  unpaidExpiredPayments: t.number,
  paidPayments: t.number,
  failedPayments: t.number,
  unrelatedPayments: t.number,
  isCancelled: t.boolean,
  attachmentCount: t.number,
  f24Count: t.number
});
export type PNMessageTemplate = t.TypeOf<typeof PNMessageTemplate>;
