import { IOResponse } from "./response";
import { validatePayload } from "../utils/validator";
import { InitializedProfile } from "../generated/definitions/backend/InitializedProfile";

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

export const getProfile = (fiscal_code: string): IOResponse => {
  return {
    payload: validatePayload(InitializedProfile, {
      ...mockProfile,
      fiscal_code
    }),
    isJson: true
  };
};
