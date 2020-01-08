import { ProblemJson } from "../../generated/definitions/backend/ProblemJson";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

export const getProblemJson = (
  status: number,
  title?: string,
  detail?: string,
  type?: string,
  instance?: string
): IOResponse<ProblemJson> => {
  return {
    payload: validatePayload(ProblemJson, {
      type,
      title,
      instance,
      detail,
      status
    }),
    isJson: true,
    status
  };
};
