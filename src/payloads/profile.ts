import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";
import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

export const user = {
  name: "Maria",
  surename: "Rossi",
  mobile: "555555555",
  spid_email: "mario.rossi@spid-email.it",
  email: "mario.rossi@email.it"
};
const currentTosVersion = 2.1;
// define here the fiscalCode used within the client communication
const spidProfile: InitializedProfile = {
  accepted_tos_version: currentTosVersion,
  email: user.email as EmailAddress,
  family_name: user.surename,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: user.name,
  spid_email: user.spid_email as EmailAddress,
  spid_mobile_phone: user.mobile as NonEmptyString,
  version: 1,
  date_of_birth: "1991-01-06",
  fiscal_code: "" as FiscalCode // injected in getProfile
};

// mock a SPID profile on first onboarding
const spidProfileFirstOnboarding: InitializedProfile = {
  email: user.email as EmailAddress,
  family_name: user.surename,
  has_profile: true,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  is_email_enabled: true,
  is_email_validated: true,
  name: user.name,
  spid_email: user.spid_email as EmailAddress,
  spid_mobile_phone: user.mobile as NonEmptyString,
  version: 0,
  date_of_birth: "1991-01-06",
  fiscal_code: "" as FiscalCode // injected in getProfile
};

const cieProfile: InitializedProfile = {
  email: user.email as EmailAddress,
  accepted_tos_version: currentTosVersion,
  family_name: user.surename,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: user.name,
  version: 1,
  date_of_birth: "1991-01-06",
  fiscal_code: "" as FiscalCode // injected in getProfile
};

// mock a cie profile on first onboarding
const cieProfileFirstOnboarding: InitializedProfile = {
  family_name: user.surename,
  has_profile: true,
  is_email_enabled: true,
  is_email_validated: false,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  name: user.name,
  version: 0,
  date_of_birth: "1991-01-06",
  fiscal_code: "" as FiscalCode // injected in getProfile
};

const currentProfile = spidProfile;
export const getProfile = (
  fiscalCode: string
): IOResponse<InitializedProfile> => {
  return {
    // inject the fiscal code
    payload: validatePayload(InitializedProfile, {
      ...currentProfile,
      fiscal_code: fiscalCode
    }),
    isJson: true
  };
};
