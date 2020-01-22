import { SuccessResponse } from "../../generated/definitions/backend/SuccessResponse";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

export const getSuccessResponse = (
  message?: string
): IOResponse<SuccessResponse> => {
  return {
    payload: validatePayload(SuccessResponse, { message }),
    isJson: true
  };
};
