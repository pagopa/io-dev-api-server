import { UserMetadata } from "../../generated/definitions/backend/UserMetadata";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

const mockUserMetadata = {
  version: 78,
  metadata: '{"organizationsOfInterest":[]}'
};

export const userMetadata: IOResponse<UserMetadata> = {
  payload: validatePayload(UserMetadata, mockUserMetadata),
  isJson: true
};
