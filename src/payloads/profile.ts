import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { PushNotificationsContentTypeEnum } from "../../generated/definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../generated/definitions/backend/ReminderStatus";
import { ServicesPreferencesModeEnum } from "../../generated/definitions/backend/ServicesPreferencesMode";
import { ioDevServerConfig } from "../config";

const profileAttrConfig = ioDevServerConfig.profile.attrs;

const optInOutputSelector =
  (reminderStatus: ReminderStatusEnum) =>
  (pushNotificationsContentType: PushNotificationsContentTypeEnum) => ({
    reminder_status: reminderStatus,
    push_notifications_content_type: pushNotificationsContentType
  });
const remindersStatusInputSelector: O.Option<ReminderStatusEnum> =
  O.fromNullable(ioDevServerConfig.profile.attrs.reminder_status);
const pushNotificationContentTypeInputSelector: O.Option<PushNotificationsContentTypeEnum> =
  O.fromNullable(
    ioDevServerConfig.profile.attrs.push_notifications_content_type
  );

type OptInProps = {
  reminder_status?: ReminderStatusEnum;
  push_notifications_content_type?: PushNotificationsContentTypeEnum;
};

const optInNotificationPreferences = pipe(
  O.some(optInOutputSelector),
  O.ap(remindersStatusInputSelector),
  O.ap(pushNotificationContentTypeInputSelector),
  O.getOrElse((): OptInProps => ({}))
);

const birthDate = "1991-01-06";
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
  date_of_birth: pipe(
    birthDate,
    DateFromString.decode,
    E.getOrElseW(() => new Date())
  ),
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
  date_of_birth: pipe(
    birthDate,
    DateFromString.decode,
    E.getOrElseW(() => new Date())
  ),
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
  date_of_birth: pipe(
    birthDate,
    DateFromString.decode,
    E.getOrElseW(() => new Date())
  ),
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
  date_of_birth: pipe(
    birthDate,
    DateFromString.decode,
    E.getOrElseW(() => new Date())
  ),
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
