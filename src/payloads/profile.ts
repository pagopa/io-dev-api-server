import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";
import { EmailAddress } from "../../generated/definitions/backend/EmailAddress";
import { InitializedProfile } from "../../generated/definitions/backend/InitializedProfile";
import { settings } from "../settings";
import { capitalizeFirstLetter } from "../utils/string";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

// define here the fiscalCode used within the client communication
const mockProfile: InitializedProfile = {
  accepted_tos_version: undefined,
  email: `${settings.user}.rossi@fake-email.it` as EmailAddress,
  family_name: "Rossi",
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: capitalizeFirstLetter(settings.user),
  spid_email: `${settings.user}.rossi@fake-spide-mail.it` as EmailAddress,
  spid_mobile_phone: "555555555" as NonEmptyString,
  version: 1,
  fiscal_code: "" as FiscalCode // injected in getProfile
};

// mock a cie profile on first onboarding
const cieProfile: InitializedProfile = {
  family_name: "Rossi",
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: false,
  is_webhook_enabled: true,
  name: "Mario",
  version: 0,
  fiscal_code: "" as FiscalCode // injected in getProfile
};

export const getProfile = (
  fiscalCode: string
): IOResponse<InitializedProfile> => {
  return {
    // inject the fiscal code
    payload: validatePayload(InitializedProfile, {
      ...cieProfile,
      fiscal_code: fiscalCode
    }),
    isJson: true
  };
};
