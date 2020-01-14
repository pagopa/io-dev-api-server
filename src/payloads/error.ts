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

export const unauthorized: IOResponse<null> = {
  payload: null,
  status: 401,
  isJson: false
};

export const notFound: IOResponse<null> = {
  payload: null,
  status: 404,
  isJson: false
};
