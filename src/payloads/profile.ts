import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { ServicesPreferencesModeEnum } from "../../generated/definitions/backend/ServicesPreferencesMode";
import { IoDevServerConfig, ProfileAttrs } from "../types/config";

const spidProfile = (profileAttrs: ProfileAttrs): InitializedProfile => ({
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  accepted_tos_version: profileAttrs.accepted_tos_version,
  email: profileAttrs.email,
  family_name: profileAttrs.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: profileAttrs.name,
  version: 1,
  date_of_birth: DateFromString.decode("1991-01-06").value as Date,
  fiscal_code: profileAttrs.fiscal_code,
  preferred_languages: profileAttrs.preferred_languages
});

// mock a SPID profile on first onboarding
const spidProfileFirstOnboarding = (
  profileAttrs: ProfileAttrs
): InitializedProfile => ({
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.LEGACY
  },
  email: profileAttrs.email,
  family_name: profileAttrs.family_name,
  has_profile: true,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  is_email_enabled: true,
  is_email_validated: true,
  name: profileAttrs.name,
  version: 0,
  date_of_birth: DateFromString.decode("1991-01-06").value as Date,
  fiscal_code: profileAttrs.fiscal_code
});

const cieProfile = (profileAttrs: ProfileAttrs): InitializedProfile => ({
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  email: profileAttrs.email,
  accepted_tos_version: profileAttrs.accepted_tos_version,
  family_name: profileAttrs.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: profileAttrs.name,
  version: 1,
  date_of_birth: DateFromString.decode("1991-01-06").value as Date,
  fiscal_code: profileAttrs.fiscal_code,
  preferred_languages: profileAttrs.preferred_languages
});

// mock a cie profile on first onboarding
const cieProfileFirstOnboarding = (
  profileAttrs: ProfileAttrs
): InitializedProfile => ({
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.LEGACY
  },
  family_name: profileAttrs.family_name,
  has_profile: true,
  is_email_enabled: true,
  is_email_validated: false,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  name: profileAttrs.name,
  version: 0,
  date_of_birth: DateFromString.decode("1991-01-06").value as Date,
  fiscal_code: profileAttrs.fiscal_code
});

const spidCie = (profile: IoDevServerConfig["profile"]) => ({
  spid: {
    first: spidProfileFirstOnboarding(profile.attrs),
    existing: spidProfile(profile.attrs)
  },
  cie: {
    first: cieProfileFirstOnboarding(profile.attrs),
    existing: cieProfile(profile.attrs)
  }
});

export const currentProfile = (profile: IoDevServerConfig["profile"]) =>
  profile.firstOnboarding
    ? spidCie(profile)[profile.authenticationProvider].first
    : spidCie(profile)[profile.authenticationProvider].existing;
