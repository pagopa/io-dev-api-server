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

export const IoDevServerConfig = t.interface({
  // some attributes of the profile used as citized
  profileAttrs: ProfileAttrs,
  // the global delay applied to all responses (0 means immediately response)
  globalDelay: t.number,
  // number of services returned
  servicesCount: t.number
});

export type IoDevServerConfig = t.TypeOf<typeof IoDevServerConfig>;
