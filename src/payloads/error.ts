import { ProblemJson } from "../../generated/definitions/backend/ProblemJson";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

export const getProblemJson = (
  status: number,
  title?: string,
  detail?: string,
  type?: string,
  instance?: string
): ProblemJson => {
  return {
    type,
    title,
    instance,
    detail,
    status
  };
};

export const invalid: IOResponse<null> = {
  payload: null,
  status: 400,
  isJson: false
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

export const conflict: IOResponse<null> = {
  payload: null,
  status: 409,
  isJson: false
};
