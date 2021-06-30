import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";
import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { ServicePreferencesSettings } from "../../generated/definitions/backend/ServicePreferencesSettings";
import { ServicesPreferencesModeEnum } from "../../generated/definitions/backend/ServicesPreferencesMode";
import { profile } from "../global";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

const currentTosVersion = 2.4;
// define here the fiscalCode used within the client communication
const spidProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO,
    version: 0 as ServicePreferencesSettings["version"]
  },
  accepted_tos_version: currentTosVersion,
  email: profile.email as EmailAddress,
  family_name: profile.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: profile.name,
  spid_email: profile.spid_email as EmailAddress,
  spid_mobile_phone: profile.mobile as NonEmptyString,
  version: 1,
  date_of_birth: new Date(1991, 0, 6).toISOString(),
  fiscal_code: "" as FiscalCode // injected in getProfile
};

// mock a SPID profile on first onboarding
const spidProfileFirstOnboarding: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO,
    version: 0 as ServicePreferencesSettings["version"]
  },
  email: profile.email as EmailAddress,
  family_name: profile.family_name,
  has_profile: true,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  is_email_enabled: true,
  is_email_validated: true,
  name: profile.name,
  spid_email: profile.spid_email as EmailAddress,
  spid_mobile_phone: profile.mobile as NonEmptyString,
  version: 0,
  date_of_birth: new Date(1991, 0, 6).toISOString(),
  fiscal_code: "" as FiscalCode // injected in getProfile
};

const cieProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO,
    version: 0 as ServicePreferencesSettings["version"]
  },
  email: profile.email as EmailAddress,
  accepted_tos_version: currentTosVersion,
  family_name: profile.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: profile.name,
  version: 1,
  date_of_birth: new Date(1991, 0, 6).toISOString(),
  fiscal_code: "" as FiscalCode // injected in getProfile
};

// mock a cie profile on first onboarding
const cieProfileFirstOnboarding: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO,
    version: 0 as ServicePreferencesSettings["version"]
  },
  family_name: profile.family_name,
  has_profile: true,
  is_email_enabled: true,
  is_email_validated: false,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  name: profile.name,
  version: 0,
  date_of_birth: new Date(1991, 0, 6).toISOString(),
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
