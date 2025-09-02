import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";

export const CreateMandateBody = t.type({
  delegate_data: FiscalCode,
  delegator_data: t.string,
  iun: t.string,
  qrcode: t.string
});
export type CreateMandateBody = t.TypeOf<typeof CreateMandateBody>;
