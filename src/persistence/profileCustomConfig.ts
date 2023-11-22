import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";

export type profileCustomConfiguration = Pick<
  InitializedProfile,
  "is_email_validated"
>;

// eslint-disable-next-line functional/no-let
let profileOriginalConfig: InitializedProfile = {} as InitializedProfile;

const profileCustomConfig: profileCustomConfiguration = {
  is_email_validated: undefined
};

export const customSetEmailValidated = (value?: boolean) => {
  // eslint-disable-next-line functional/immutable-data
  profileCustomConfig.is_email_validated = value;
};

export function setOriginalProfileConfig(currentProfile: InitializedProfile) {
  profileOriginalConfig = {...currentProfile};
}

export function applyCustomProfileConfig(currentProfile: InitializedProfile) {
  // eslint-disable-next-line guard-for-in
  for (const key in profileCustomConfig) {
    const castedKey = key as keyof profileCustomConfiguration;
    if (profileCustomConfig[castedKey] !== undefined) {
      // eslint-disable-next-line functional/immutable-data
      currentProfile[castedKey] = profileCustomConfig[castedKey];
    } else {
      // eslint-disable-next-line functional/immutable-data
      currentProfile[castedKey] = profileOriginalConfig[castedKey];
    }
  }
}
