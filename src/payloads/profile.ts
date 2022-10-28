import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { ServicesPreferencesModeEnum } from "../../generated/definitions/backend/ServicesPreferencesMode";
import { ioDevServerConfig } from "../config";
import { ReminderStatusEnum } from "../../generated/definitions/backend/ReminderStatus";
import { PushNotificationsContentTypeEnum } from "../../generated/definitions/backend/PushNotificationsContentType";

const profileAttrConfig = ioDevServerConfig.profile.attrs;

const optInOutputSelector = (reminder_status: ReminderStatusEnum) => (
  push_notifications_content_type: PushNotificationsContentTypeEnum
) => ({
  reminder_status,
  push_notifications_content_type
});
const remindersStatusInputSelector: O.Option<ReminderStatusEnum> = O.fromNullable(
  ioDevServerConfig.profile.attrs.reminder_status
);
const pushNotificationContentTypeInputSelector: O.Option<PushNotificationsContentTypeEnum> = O.fromNullable(
  ioDevServerConfig.profile.attrs.push_notifications_content_type
);

const optInNotificationPreferences = pipe(
  O.some(optInOutputSelector),
  O.ap(remindersStatusInputSelector),
  O.ap(pushNotificationContentTypeInputSelector),
  O.getOrElse(() => ({}))
);

const spidProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  accepted_tos_version: profileAttrConfig.accepted_tos_version,
  email: profileAttrConfig.email,
  family_name: profileAttrConfig.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: profileAttrConfig.name,
  version: 1,
  date_of_birth: DateFromString.decode("1991-01-06").value as Date,
  fiscal_code: profileAttrConfig.fiscal_code,
  preferred_languages: profileAttrConfig.preferred_languages,
  ...optInNotificationPreferences
};

// mock a SPID profile on first onboarding
const spidProfileFirstOnboarding: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.LEGACY
  },
  email: profileAttrConfig.email,
  family_name: profileAttrConfig.family_name,
  has_profile: true,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  is_email_enabled: true,
  is_email_validated: true,
  name: profileAttrConfig.name,
  version: 0,
  date_of_birth: DateFromString.decode("1991-01-06").value as Date,
  fiscal_code: profileAttrConfig.fiscal_code
};

const cieProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  email: profileAttrConfig.email,
  accepted_tos_version: profileAttrConfig.accepted_tos_version,
  family_name: profileAttrConfig.family_name,
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: profileAttrConfig.name,
  version: 1,
  date_of_birth: DateFromString.decode("1991-01-06").value as Date,
  fiscal_code: profileAttrConfig.fiscal_code,
  preferred_languages: profileAttrConfig.preferred_languages,
  ...optInNotificationPreferences
};

// mock a cie profile on first onboarding
const cieProfileFirstOnboarding: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.LEGACY
  },
  family_name: profileAttrConfig.family_name,
  has_profile: true,
  is_email_enabled: true,
  is_email_validated: false,
  is_inbox_enabled: false,
  is_webhook_enabled: false,
  name: profileAttrConfig.name,
  version: 0,
  date_of_birth: DateFromString.decode("1991-01-06").value as Date,
  fiscal_code: profileAttrConfig.fiscal_code
};
const spidCie = {
  spid: {
    first: spidProfileFirstOnboarding,
    existing: spidProfile
  },
  cie: {
    first: cieProfileFirstOnboarding,
    existing: cieProfile
  }
};
export const currentProfile = ioDevServerConfig.profile.firstOnboarding
  ? spidCie[ioDevServerConfig.profile.authenticationProvider].first
  : spidCie[ioDevServerConfig.profile.authenticationProvider].existing;
