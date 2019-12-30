import { IOResponse } from "./response";
import { validatePayload } from "../utils/validator";
import { InitializedProfile } from "../generated/definitions/backend/InitializedProfile";

export const fiscalCode = "ISPXNB32R82Y766E";

const mockProfile = {
  accepted_tos_version: 1,
  email: "fake@email.it",
  family_name: "Rossi",
  fiscal_code: fiscalCode,
  has_profile: true,
  is_inbox_enabled: true,
  is_webhook_enabled: true,
  name: "John",
  spid_email: "fake_spid@email.it",
  spid_mobile_phone: "555555555",
  version: 6
};

export const profile: IOResponse = {
  payload: validatePayload(InitializedProfile, mockProfile),
  isJson: true
};
