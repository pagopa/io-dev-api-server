import { UserProfile } from "../generated/definitions/backend/UserProfile";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

// define here the fiscalCode used within the client communication

const mockProfile = {
  accepted_tos_version: 1,
  email: "fake@email.it",
  family_name: "Doe",
  has_profile: true,
  is_inbox_enabled: true,
  is_webhook_enabled: true,
  name: "John",
  spid_email: "fake_spid@email.it",
  spid_mobile_phone: "555555555",
  version: 6
};

export const getProfile = (fiscalCode: string): IOResponse<UserProfile> => {
  return {
    payload: validatePayload(UserProfile, {
      ...mockProfile,
      fiscal_code: fiscalCode
    }),
    isJson: true
  };
};
