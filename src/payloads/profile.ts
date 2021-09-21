import { FiscalCode } from "italia-ts-commons/lib/strings";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { ServicesPreferencesModeEnum } from "../../generated/definitions/backend/ServicesPreferencesMode";
import { ioDevServerConfig } from "../global";
import { validatePayload } from "../utils/validator";

const currentTosVersion = 2.4;
const spidProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  accepted_tos_version: currentTosVersion,
  email: ioDevServerConfig.profileAttrs.email,
  family_name: ioDevServerConfig.profileAttrs.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: ioDevServerConfig.profileAttrs.name,
  spid_email: ioDevServerConfig.profileAttrs.spid_email,
  spid_mobile_phone: ioDevServerConfig.profileAttrs.mobile,
  version: 1,
  date_of_birth: new Date(1991, 0, 6).toISOString(),
  fiscal_code: "" as FiscalCode // injected in getProfile
};

// mock a SPID profile on first onboarding
const spidProfileFirstOnboarding: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.LEGACY
  },
  email: ioDevServerConfig.profileAttrs.email,
  family_name: ioDevServerConfig.profileAttrs.family_name,
  has_profile: true,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  is_email_enabled: true,
  is_email_validated: true,
  name: ioDevServerConfig.profileAttrs.name,
  spid_email: ioDevServerConfig.profileAttrs.spid_email,
  spid_mobile_phone: ioDevServerConfig.profileAttrs.mobile,
  version: 0,
  date_of_birth: new Date(1991, 0, 6).toISOString(),
  fiscal_code: "" as FiscalCode // injected in getProfile
};

const cieProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  email: ioDevServerConfig.profileAttrs.email,
  accepted_tos_version: currentTosVersion,
  family_name: ioDevServerConfig.profileAttrs.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: ioDevServerConfig.profileAttrs.name,
  version: 1,
  date_of_birth: new Date(1991, 0, 6).toISOString(),
  fiscal_code: "" as FiscalCode // injected in getProfile
};

// mock a cie profile on first onboarding
const cieProfileFirstOnboarding: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.LEGACY
  },
  family_name: ioDevServerConfig.profileAttrs.family_name,
  has_profile: true,
  is_email_enabled: true,
  is_email_validated: false,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  name: ioDevServerConfig.profileAttrs.name,
  version: 0,
  date_of_birth: new Date(1991, 0, 6).toISOString(),
  fiscal_code: "" as FiscalCode // injected in getProfile
};

const currentProfile = spidProfile;
export const getProfile = (fiscalCode: string): InitializedProfile =>
  validatePayload(InitializedProfile, {
    ...currentProfile,
    fiscal_code: fiscalCode
  });
