import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";
import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

// mock a SPID profile (if you want simulate first onboarding set version:0 and accepted_tos_version:undefined)
const spidProfile: InitializedProfile = {
  accepted_tos_version: 1,
  email: "mario.rossi@fake-email.it" as EmailAddress,
  family_name: "Rossi",
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: "Mario",
  spid_email: "mario.rossi@fake-spide-mail.it" as EmailAddress,
  spid_mobile_phone: "555555555" as NonEmptyString,
  version: 1,
  fiscal_code: "" as FiscalCode, // injected in getProfile
};

// mock a cie profile on first onboarding
const cieProfile: InitializedProfile = {
  family_name: "Rossi",
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: false,
  is_webhook_enabled: true,
  name: "Mario",
  version: 0,
  fiscal_code: "" as FiscalCode, // injected in getProfile
};

export const getProfile = (
  fiscalCode: string
): IOResponse<InitializedProfile> => {
  return {
    // inject the fiscal code
    payload: validatePayload(InitializedProfile, {
      ...spidProfile,
      fiscal_code: fiscalCode,
    }),
    isJson: true,
  };
};
