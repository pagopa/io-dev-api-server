import { IOResponse } from "./response";
import { validatePayload } from "../utils/validator";
import { UserMetadata } from "../generated/definitions/backend/UserMetadata";

const mockUserMetadata = {
  version: 78,
  metadata: '{"organizationsOfInterest":[]}'
};

export const userMetadata: IOResponse = {
  payload: validatePayload(UserMetadata, mockUserMetadata),
  isJson: true
};
